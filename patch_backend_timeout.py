import re

with open('server/controllers/bookingController.js', 'r') as f:
    content = f.read()

# When the nearest worker is > 15km away, or there are no bots, we should automatically cancel the booking
# after a short timeout so the UI can pop up the "No Workers Found" dialog instead of just hanging forever.

old_skip = "console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Skipping auto-accept.`);"
new_skip = """console.log(`Nearest worker is ${minDistance.toFixed(2)}km away. Auto-canceling booking.`);
                const bookingToCancel = await Booking.findById(savedBooking._id);
                if (bookingToCancel && bookingToCancel.status === 'pending') {
                    bookingToCancel.status = 'cancelled';
                    bookingToCancel.cancelReason = 'Timeout: No worker accepted the request';
                    await bookingToCancel.save();
                    const io = socket.getIO();
                    io.to(bookingToCancel.userId._id.toString()).emit('bookingStatusUpdated', bookingToCancel);
                }"""

content = content.replace(old_skip, new_skip)

# Also if bots.length === 0
# Look for `if (bots.length > 0) {`
# The original structure:
#        if (bots.length > 0) {
#            let nearestBot = bots[0];

content = content.replace("        if (bots.length > 0) {\n            let nearestBot = bots[0];", """        if (bots.length > 0) {
            let nearestBot = bots[0];""")

# Let's write a safer regex or simple replacement to handle empty bots array
old_empty = """        const bots = await Worker.find({
            isBot: true,
            status: 'Active',
            category: serviceCategory
        });

        if (bots.length > 0) {"""

new_empty = """        const bots = await Worker.find({
            isBot: true,
            status: 'Active',
            category: serviceCategory
        });

        if (bots.length === 0) {
            const bookingToCancel = await Booking.findById(savedBooking._id);
            if (bookingToCancel && bookingToCancel.status === 'pending') {
                bookingToCancel.status = 'cancelled';
                bookingToCancel.cancelReason = 'Timeout: No workers available in category';
                await bookingToCancel.save();
                const io = socket.getIO();
                io.to(bookingToCancel.userId._id.toString()).emit('bookingStatusUpdated', bookingToCancel);
            }
            return;
        }

        if (bots.length > 0) {"""

content = content.replace(old_empty, new_empty)

with open('server/controllers/bookingController.js', 'w') as f:
    f.write(content)
