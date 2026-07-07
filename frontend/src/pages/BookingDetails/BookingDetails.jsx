import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Star, MessageSquare, 
  XCircle, CheckCircle, Navigation, Award, Smile
} from 'lucide-react';
import MapView from '../../components/MapView';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Fetch booking details
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}`);
      return res.data.booking || null;
    },
    refetchInterval: (query) => {
      // Poll details frequently if the status is active to track dispatch updates
      const status = query.state.data?.status;
      if (['SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(status)) {
        return 5000;
      }
      return false;
    }
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async (reason) => {
      const res = await api.post(`/bookings/${id}/cancel`, { cancel_reason: reason || 'User requested cancel' });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Booking cancelled.');
      queryClient.invalidateQueries(['booking', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    }
  });

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/bookings/${id}/review`, {
        rating,
        comment,
        tags: rating >= 4 ? ['professional', 'would_recommend'] : ['friendly'],
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Thank you! Review submitted.');
      setReviewSubmitted(true);
      queryClient.invalidateQueries(['booking', id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    }
  });

  const getStatusMessage = (status) => {
    switch (status) {
      case 'DRAFT': return 'Booking draft has been created.';
      case 'SEARCHING': return 'Broadcasting request to nearby technicians...';
      case 'ACCEPTED': return 'Technician has accepted your booking and is preparing.';
      case 'EN_ROUTE': return 'Technician is currently traveling to your location.';
      case 'ARRIVED': return 'Technician has arrived at your address.';
      case 'IN_PROGRESS': return 'Service is currently in progress. Please review once completed.';
      case 'COMPLETED': return 'This service booking has been successfully completed!';
      case 'CANCELLED': return 'This booking has been cancelled.';
      default: return 'Booking request expired.';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-success';
      case 'CANCELLED': return 'text-danger';
      case 'SEARCHING': return 'text-warning';
      default: return 'text-info';
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ height: '300px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading details...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container text-center py-5">
        <h5 className="text-danger fw-bold">Booking Not Found</h5>
        <p className="text-secondary small">The requested booking could not be loaded.</p>
        <Link to="/bookings" className="btn btn-success mt-3">Back to History</Link>
      </div>
    );
  }

  const isBookingActive = ['SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status);

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2 border hover-bg-light">
          <ArrowLeft size={18} className="text-secondary" />
        </button>
        <div>
          <h4 className="fw-bold mb-0 text-dark">Track Booking</h4>
          <span className="text-secondary small">ID: {booking._id}</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Dispatch Map & Live Status */}
        <div className="col-lg-6">
          {/* Radar Dispatch Simulation Map */}
          {isBookingActive && (
            <div className="mb-4">
              <MapView 
                userLocation={{ latitude: booking.location.coordinates[1], longitude: booking.location.coordinates[0] }}
                providerLocation={booking.provider_id ? { latitude: booking.location.coordinates[1] + 0.005, longitude: booking.location.coordinates[0] + 0.005, bearing: 45 } : null}
                height={260}
              />
            </div>
          )}

          {/* Status Tracker */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold mb-2">Service Status</h5>
            <h6 className={`fw-bold mb-3 ${getStatusColor(booking.status)}`}>
              {booking.status}
            </h6>
            <div className="alert bg-light border-0 small text-secondary py-3 mb-3">
              {getStatusMessage(booking.status)}
            </div>

            {/* OTP Verification code (PIN) for validation */}
            {booking.otp_code && isBookingActive && (
              <div className="p-3 border rounded text-center mb-3 bg-light">
                <span className="text-secondary small d-block mb-1">Share this OTP code to start service:</span>
                <strong className="text-success fs-3 tracking-wider" style={{ letterSpacing: 4 }}>
                  {booking.otp_code}
                </strong>
              </div>
            )}

            <div className="small text-secondary mb-1 d-flex align-items-center gap-1">
              <Calendar size={14} /> Created: {dayjs(booking.created_at).format('MMM DD, YYYY hh:mm A')}
            </div>
            <div className="small text-secondary mb-0 d-flex align-items-center gap-1">
              <MapPin size={14} /> {booking.formatted_address}
            </div>
          </div>
        </div>

        {/* Right Column: Provider info & Reviews / Receipts */}
        <div className="col-lg-6">
          {/* Dispatch Technician Profile */}
          {booking.provider_id && (
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
              <h5 className="fw-bold text-dark mb-3">Your Technician</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold bg-success"
                  style={{ width: 50, height: 50, fontSize: 18 }}
                >
                  {booking.provider_id.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h6 className="fw-bold mb-0 text-dark">{booking.provider_id.name}</h6>
                  <span className="text-secondary small d-flex align-items-center gap-1">
                    <Star size={14} className="fill-warning text-warning" /> 
                    {booking.provider_id.average_rating || '4.8'} ({booking.provider_id.total_reviews || '12'} reviews)
                  </span>
                </div>
              </div>

              {isBookingActive && (
                <div className="d-flex gap-2">
                  <Link 
                    to={`/messages?providerId=${booking.provider_id._id}`} 
                    className="btn btn-success w-100 py-2 fw-bold text-white d-flex align-items-center justify-content-center gap-2"
                  >
                    <MessageSquare size={16} /> Chat with Technician
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Payment Receipt Summary */}
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="fw-bold text-dark mb-3">Receipt Summary</h5>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Base Fare:</span>
              <span>₱{booking.base_fare}.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Distance surcharge:</span>
              <span>₱{booking.distance_fee}.00</span>
            </div>
            <div className="d-flex justify-content-between mb-2 small text-secondary">
              <span>Platform service fee:</span>
              <span>₱{booking.platform_fee}.00</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold text-dark fs-5">
              <span>Total Amount:</span>
              <span className="text-success">₱{booking.total_amount}.00</span>
            </div>
          </div>

          {/* Submit Review Form (if completed and no review written yet) */}
          {booking.status === 'COMPLETED' && !booking.review_submitted && !reviewSubmitted && (
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', backgroundColor: '#F4F9F5', border: '1px solid #D1E7DD' }}>
              <h5 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                <Smile /> Rate the Technician
              </h5>
              <p className="text-secondary small mb-3">Your rating helps us keep the FixConnect network highly reliable.</p>
              
              <div className="mb-3">
                <label className="form-label small fw-bold">Select Stars</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      className="btn p-1 border-0 bg-transparent"
                      onClick={() => setRating(star)}
                    >
                      <Star size={24} className={star <= rating ? 'fill-warning text-warning' : 'text-secondary'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Review Comment</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Share details of your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button 
                className="btn btn-success w-100 py-2 fw-bold text-white shadow-sm"
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
              >
                Submit Review
              </button>
            </div>
          )}

          {/* Cancel button for active dispatch */}
          {booking.status === 'SEARCHING' && (
            <button 
              className="btn btn-outline-danger w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mt-3"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel your dispatch technician request?')) {
                  cancelMutation.mutate('User requested cancellation');
                }
              }}
              disabled={cancelMutation.isPending}
            >
              <XCircle size={16} /> Cancel Booking Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
