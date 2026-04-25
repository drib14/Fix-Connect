const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const socket = require('../socket');
const axios = require('axios');

// Helper to standard responses
const createResponse = (success, message, data = null) => {
  return { success, message, data };
};

// Create a notification and emit it
const createAndEmitNotification = async (userId, message) => {
  try {
    const notification = new Notification({ user: userId, message });
    await notification.save();

    const io = socket.getIO();
    io.to(userId.toString()).emit('newNotification', notification);
  } catch (err) {
    console.error('Failed to create notification', err);
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { serviceCategory, address, lat, lng, paymentMethod } = req.body;

    // Basic Validation
    if (!serviceCategory || !address || lat === undefined || lng === undefined) {
      return res.status(400).json(createResponse(false, 'Missing required fields or location coordinates.'));
    }

    // 1-Booking Rule Check
    const existingActiveBooking = await Booking.findOne({
      userId: req.user._id,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });

    if (existingActiveBooking) {
        return res.status(400).json(createResponse(false, 'You already have an active booking. Please wait for it to complete or cancel it before booking another.'));
    }

    // Lock price
    const baseFee = 500;
    const transpoFee = 30;
    const priceAtBooking = baseFee + transpoFee;
    const tax = priceAtBooking * 0.12;
    const totalAmount = priceAtBooking + tax;

    let paymentUrl = null;
    let paymentReference = null;

    const bookingId = new mongoose.Types.ObjectId();

    // Handle digital payments
    if (paymentMethod && paymentMethod !== 'Cash') {
      try {
        let paymongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (paymongoSecret && !paymongoSecret.startsWith('sk_') && process.env.PAYMONGO_PUBLIC_KEY && process.env.PAYMONGO_PUBLIC_KEY.startsWith('sk_')) {
          paymongoSecret = process.env.PAYMONGO_PUBLIC_KEY;
        }
        const encodedSecret = Buffer.from(`${paymongoSecret}:`).toString('base64');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const paymentData = {
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              line_items: [
                {
                  currency: 'PHP',
                  amount: Math.round(totalAmount * 100),
                  description: `FixConnect Booking: ${serviceCategory}`,
                  name: `Service: ${serviceCategory}`,
                  quantity: 1
                }
              ],
              payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
              description: `FixConnect Booking: ${serviceCategory}`,
              success_url: `${frontendUrl}/booking/${bookingId}`,
              cancel_url: `${frontendUrl}/`
            }
          }
        };

        const response = await axios.post('https://api.paymongo.com/v1/checkout_sessions', paymentData, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Basic ${encodedSecret}`
          }
        });

        if (response.data && response.data.data) {
          paymentUrl = response.data.data.attributes.checkout_url;
          paymentReference = response.data.data.id;
        }
      } catch (paymentError) {
        console.error('PayMongo link creation error:', paymentError.response?.data || paymentError.message);
        return res.status(500).json(createResponse(false, 'Failed to initialize payment gateway.'));
      }
    }

    // Set expiration 3 minutes from now for 'pending' state (ride hailing standard)
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    const newBooking = new Booking({
      _id: bookingId,
      userId: req.user._id,
      serviceCategory,
      address,
      coordinates: { lat, lng },
      priceAtBooking,
      tax,
      totalAmount,
      status: 'pending',
      paymentMethod: paymentMethod || 'Cash',
      paymentUrl,
      paymentReference,
      paymentStatus: paymentUrl ? 'pending' : 'paid', // simplistic logic
      expiresAt
    });

    const savedBooking = await newBooking.save();

    // Broadcast to available workers
    const io = socket.getIO();
    io.emit('newAvailableJob', savedBooking);

    await createAndEmitNotification(req.user._id, `Your booking for ${serviceCategory} was created and is pending worker acceptance.`);

    res.status(201).json(createResponse(true, 'Booking successfully created!', savedBooking));

    // Bot Auto-Accept Logic
    setTimeout(async () => {
      try {
        const Worker = require('../models/Worker');
        const socket = require('../socket');
        // Find a bot worker that offers the category, preferring active ones
        const bots = await Worker.find({
            isBot: true,
            status: 'Active',
            category: serviceCategory
        });

        if (bots.length === 0) {
            console.log(`No bots found for category ${serviceCategory}. Leaving booking pending for real workers.`);
            return;
        }

        if (bots.length > 0) {
            // Find nearest bot
            const getDistance = (lat1, lon1, lat2, lon2) => {
              const R = 6371; // Radius of the earth in km
              const dLat = (lat2 - lat1) * (Math.PI / 180);
              const dLon = (lon2 - lon1) * (Math.PI / 180);
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) *
                  Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const d = R * c; // Distance in km
              return d;
            };

            let nearestBot = bots[0];
            let minDistance = getDistance(lat, lng, nearestBot.currentLocation.lat, nearestBot.currentLocation.lng);
            for (let i = 1; i < bots.length; i++) {
                let distance = getDistance(lat, lng, bots[i].currentLocation.lat, bots[i].currentLocation.lng);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestBot = bots[i];
                }
            }
            if (minDistance > 15) {
                console.log(`Nearest bot worker is ${minDistance.toFixed(2)}km away. Leaving booking pending for real nearby workers.`);
                return;
            }
            const bot = nearestBot;

            const bookingToAccept = await Booking.findById(savedBooking._id);
            if (bookingToAccept && bookingToAccept.status === 'pending') {
                bookingToAccept.status = 'accepted';
                bookingToAccept.workerId = bot._id;
                bookingToAccept.workerLocation = bot.currentLocation;
                bookingToAccept.acceptedAt = new Date();
                const acceptedBooking = await bookingToAccept.save();

                const populatedBooking = await Booking.findById(acceptedBooking._id).populate('workerId userId');

                const io = socket.getIO();
                // Emit success
                io.to(populatedBooking.userId._id.toString()).emit('jobAccepted', populatedBooking);
                await createAndEmitNotification(populatedBooking.userId._id, `Your booking has been accepted by ${bot.name}.`);

                // Fetch route from OSRM
                try {
                    // OSRM expects lng,lat
                    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${bot.currentLocation.lng},${bot.currentLocation.lat};${lng},${lat}?overview=full&geometries=geojson`;
                    const response = await axios.get(osrmUrl);

                    if (response.data && response.data.routes && response.data.routes.length > 0) {
                        const routeCoords = response.data.routes[0].geometry.coordinates; // Array of [lng, lat]
                        let currentStep = 0;
                        const totalSteps = routeCoords.length;

                        // Move the bot every 1 second along the route
                        const moveInterval = setInterval(async () => {
                            try {
                                if (currentStep >= totalSteps) {
                                    clearInterval(moveInterval);
                                    // Arrived!
                                    const progressBooking = await Booking.findById(acceptedBooking._id);
                                    if (progressBooking && progressBooking.status === 'accepted') {
                                        progressBooking.status = 'in_progress';
                                        await progressBooking.save();
                                        const popProg = await Booking.findById(progressBooking._id).populate('workerId userId');
                                        const ioProg = socket.getIO();
                                        ioProg.to(progressBooking.userId._id.toString()).emit('bookingStatusUpdated', popProg);
                                        await createAndEmitNotification(progressBooking.userId._id, `${bot.name} has arrived at your location.`);

                                        // Simulate work done after 15 seconds
                                        setTimeout(async () => {
                                            try {
                                                const finishBooking = await Booking.findById(acceptedBooking._id);
                                                if (finishBooking && finishBooking.status === 'in_progress') {
                                                    finishBooking.status = 'completed';
                                                    finishBooking.completedAt = new Date();
                                                    await finishBooking.save();
                                                    const popFinish = await Booking.findById(finishBooking._id).populate('workerId userId');
                                                    const ioFin = socket.getIO();
                                                    ioFin.to(finishBooking.userId._id.toString()).emit('bookingStatusUpdated', popFinish);
                                                    await createAndEmitNotification(finishBooking.userId._id, `${bot.name} has completed the job.`);
                                                }
                                            } catch (err) {
                                                console.error('Bot simulation error completing job:', err);
                                            }
                                        }, 15000);
                                    }
                                    return;
                                }

                                // Emit location update
                                const [currentLng, currentLat] = routeCoords[currentStep];
                                const ioLoc = socket.getIO();

                                // To prevent DB overload, only save to DB every 5 steps (5 seconds)
                                if (currentStep % 5 === 0) {
                                    await Booking.findByIdAndUpdate(acceptedBooking._id, {
                                        workerLocation: { lat: currentLat, lng: currentLng }
                                    });
                                }

                                ioLoc.to(populatedBooking.userId._id.toString()).emit('workerLocationUpdate', {
                                    bookingId: acceptedBooking._id,
                                    lat: currentLat,
                                    lng: currentLng
                                });

                                currentStep++;
                            } catch (err) {
                                console.error('Bot simulation error in moveInterval:', err);
                            }
                        }, 1000); // Move every 1s
                    } else {
                        // Fallback if no route found: teleport and arrive in 10s
                        setTimeout(async () => {
                           try {
                               const progressBooking = await Booking.findById(acceptedBooking._id);
                               if (progressBooking && progressBooking.status === 'accepted') {
                                   progressBooking.status = 'in_progress';
                                   await progressBooking.save();
                                   const popProg = await Booking.findById(progressBooking._id).populate('workerId userId');
                                   const ioProg = socket.getIO();
                                   ioProg.to(progressBooking.userId._id.toString()).emit('bookingStatusUpdated', popProg);
                                   await createAndEmitNotification(progressBooking.userId._id, `${bot.name} has arrived at your location.`);

                                   // Simulate work done after 15 seconds
                                   setTimeout(async () => {
                                       try {
                                           const finishBooking = await Booking.findById(acceptedBooking._id);
                                           if (finishBooking && finishBooking.status === 'in_progress') {
                                               finishBooking.status = 'completed';
                                               finishBooking.completedAt = new Date();
                                               await finishBooking.save();
                                               const popFinish = await Booking.findById(finishBooking._id).populate('workerId userId');
                                               const ioFin = socket.getIO();
                                               ioFin.to(finishBooking.userId._id.toString()).emit('bookingStatusUpdated', popFinish);
                                               await createAndEmitNotification(finishBooking.userId._id, `${bot.name} has completed the job.`);
                                           }
                                       } catch(err) {
                                           console.error('Fallback error completing job:', err);
                                       }
                                   }, 15000);
                               }
                           } catch (err) {
                               console.error('Fallback error arriving at location:', err);
                           }
                        }, 10000);
                    }
                } catch (osrmError) {
                    console.error("OSRM Route Error:", osrmError);
                    // Fallback on error: teleport and arrive in 10s
                    setTimeout(async () => {
                       try {
                           const progressBooking = await Booking.findById(acceptedBooking._id);
                           if (progressBooking && progressBooking.status === 'accepted') {
                               progressBooking.status = 'in_progress';
                               await progressBooking.save();
                               const popProg = await Booking.findById(progressBooking._id).populate('workerId userId');
                               const ioProg = socket.getIO();
                               ioProg.to(progressBooking.userId._id.toString()).emit('bookingStatusUpdated', popProg);
                               await createAndEmitNotification(progressBooking.userId._id, `${bot.name} has arrived at your location.`);

                               // Simulate work done after 15 seconds
                               setTimeout(async () => {
                                   try {
                                       const finishBooking = await Booking.findById(acceptedBooking._id);
                                       if (finishBooking && finishBooking.status === 'in_progress') {
                                           finishBooking.status = 'completed';
                                           finishBooking.completedAt = new Date();
                                           await finishBooking.save();
                                           const popFinish = await Booking.findById(finishBooking._id).populate('workerId userId');
                                           const ioFin = socket.getIO();
                                           ioFin.to(finishBooking.userId._id.toString()).emit('bookingStatusUpdated', popFinish);
                                           await createAndEmitNotification(finishBooking.userId._id, `${bot.name} has completed the job.`);
                                       }
                                   } catch(err) {
                                       console.error('Fallback OSRM error completing job:', err);
                                   }
                               }, 15000);
                           }
                       } catch (err) {
                           console.error('Fallback OSRM error arriving at location:', err);
                       }
                    }, 10000);
                }
            }
        }
      } catch (e) {
          console.error("Bot auto-accept error:", e);
      }
    }, 3000); // 3 seconds delay for auto-accept simulation

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json(createResponse(false, 'Failed to create booking.'));
  }
};

exports.getAvailableJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json(createResponse(false, 'Only workers can view the job pool.'));
    }

    // Auto-cancel expired 'pending' bookings
    await Booking.updateMany({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    }, {
      $set: { status: 'cancelled', cancelledAt: new Date() }
    });

    const jobs = await Booking.find({
      status: 'pending',
      serviceCategory: worker.category
    }).populate('userId', 'name email location').sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get Available Jobs Error:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch available jobs.'));
  }
};

exports.acceptJob = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json(createResponse(false, 'Only workers can accept jobs.'));
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json(createResponse(false, 'Booking not found.'));
    }

    // Strict state check
    if (booking.status !== 'pending') {
      return res.status(400).json(createResponse(false, `Booking cannot be accepted. Current status is ${booking.status}.`));
    }

    // Double Booking Prevention
    const conflictBooking = await Booking.findOne({
      workerId: worker._id,
      status: { $in: ['accepted', 'in_progress'] }
    });

    if (conflictBooking) {
      return res.status(400).json(createResponse(false, 'You already have another active job.'));
    }

    booking.workerId = worker._id;
    booking.status = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate('workerId userId');

    const io = socket.getIO();
    io.to(booking.userId.toString()).emit('jobAccepted', populatedBooking);
    io.emit('jobRemoved', booking._id);

    await createAndEmitNotification(booking.userId, `Your booking for ${booking.serviceCategory} has been accepted by ${worker.name}.`);

    res.status(200).json(createResponse(true, 'Job accepted successfully!', populatedBooking));
  } catch (error) {
    console.error('Accept Job Error:', error);
    res.status(500).json(createResponse(false, 'Failed to accept job.'));
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lat, lng } = req.body;
    const userId = req.user._id.toString();

    const booking = await Booking.findById(id).populate('workerId userId');
    if (!booking) {
      return res.status(404).json(createResponse(false, 'Booking not found.'));
    }

    // Authorization: Only assigned worker can update status
    if (booking.workerId) {
      if (booking.workerId.userId.toString() !== userId) {
        return res.status(403).json(createResponse(false, 'You are not authorized to update this booking.'));
      }
    } else {
      // If unassigned (pending), only the customer can reject/cancel their own booking.
      // Workers should use the 'acceptJob' route, not this generic status updater.
      if (booking.userId._id.toString() !== userId) {
        return res.status(403).json(createResponse(false, 'You are not authorized to update this booking.'));
      }
    }

    // State machine logic
    const currentStatus = booking.status;
    let validTransition = false;

    if (currentStatus === 'pending' && status === 'rejected') validTransition = true;
    if (currentStatus === 'accepted' && status === 'in_progress') validTransition = true;
    if (currentStatus === 'in_progress' && status === 'completed') validTransition = true;

    // Cancellation rules
    if (status === 'cancelled') {
        if (currentStatus === 'pending') validTransition = true; // Anyone can cancel pending
        if (currentStatus === 'accepted') validTransition = true; // Handled below
    }

    if (!validTransition) {
       return res.status(400).json(createResponse(false, `Invalid state transition from ${currentStatus} to ${status}.`));
    }

    booking.status = status;

    if (status === 'completed') booking.completedAt = new Date();
    if (status === 'cancelled') booking.cancelledAt = new Date();

    if (lat && lng) {
      booking.workerLocation = { lat, lng };
    }

    await booking.save();

    // Emits
    const io = socket.getIO();
    io.to(id).emit('bookingStatusUpdated', booking);
    io.to(booking.userId._id.toString()).emit('bookingStatusUpdated', booking);

    await createAndEmitNotification(booking.userId._id, `Your booking status was updated to ${status}.`);

    res.status(200).json(createResponse(true, 'Booking status updated successfully.', booking));
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json(createResponse(false, 'Failed to update booking status.'));
  }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id.toString();

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json(createResponse(false, 'Booking not found.'));
        }

        const isCustomer = booking.userId.toString() === userId;
        // Populate worker to check user ID
        await booking.populate('workerId');
        const isAssignedWorker = booking.workerId && booking.workerId.userId.toString() === userId;

        if (!isCustomer && !isAssignedWorker) {
             return res.status(403).json(createResponse(false, 'Not authorized to cancel this booking.'));
        }

        // Customer Cancellation Rules
        if (isCustomer) {
            if (booking.status !== 'pending' && booking.status !== 'accepted') {
                return res.status(400).json(createResponse(false, 'Customer can only cancel pending or accepted bookings.'));
            }
        }

        // Worker Cancellation Rules
        if (isAssignedWorker) {
            if (booking.status !== 'accepted') {
                return res.status(400).json(createResponse(false, 'Worker can only cancel accepted bookings before they start.'));
            }
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        if (reason) booking.cancellationReason = reason;
        await booking.save();

        const io = socket.getIO();
        io.to(id).emit('bookingStatusUpdated', booking);
        io.to(booking.userId.toString()).emit('bookingStatusUpdated', booking);

        // Notify the other party
        if (isCustomer && booking.workerId) {
             await createAndEmitNotification(booking.workerId.userId, `Customer cancelled the booking for ${booking.serviceCategory}.`);
        } else if (isAssignedWorker) {
             await createAndEmitNotification(booking.userId, `Worker cancelled the booking for ${booking.serviceCategory}.`);
        }

        res.status(200).json(createResponse(true, 'Booking cancelled successfully.', booking));
    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json(createResponse(false, 'Failed to cancel booking.'));
    }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const workerProfile = await Worker.findOne({ userId });
    let query = { userId };
    if (workerProfile) {
        query = { $or: [{ userId: userId }, { workerId: workerProfile._id }] };
    }

    const bookings = await Booking.find(query).populate('workerId userId').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch user bookings.'));
  }
};

exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('workerId userId');
        if (!booking) {
             return res.status(404).json(createResponse(false, 'Booking not found.'));
        }
        res.status(200).json(createResponse(true, 'Booking fetched.', booking));
    } catch (error) {
        console.error('Get Booking By ID Error:', error);
        res.status(500).json(createResponse(false, 'Failed to fetch booking details.'));
    }
}

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch bookings.'));
  }
};
