import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Calendar, Clock, AlertCircle, MapPin, ChevronRight } from 'lucide-react';
import { BookingsListSkeleton } from '../../components/SkeletalLoader';
import dayjs from 'dayjs';

export default function BookingHistory() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookingsHistory'],
    queryFn: async () => {
      const res = await api.get('/bookings/history');
      return res.data.bookings || [];
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT': return <span className="badge bg-secondary">Draft</span>;
      case 'SEARCHING': return <span className="badge bg-warning text-dark animate-pulse">Searching...</span>;
      case 'ACCEPTED': return <span className="badge bg-info text-white">Accepted</span>;
      case 'EN_ROUTE': return <span className="badge bg-info text-white">En Route</span>;
      case 'ARRIVED': return <span className="badge bg-info text-white">Arrived</span>;
      case 'IN_PROGRESS': return <span className="badge bg-primary text-white">In Progress</span>;
      case 'COMPLETED': return <span className="badge bg-success text-white">Completed</span>;
      case 'CANCELLED': return <span className="badge bg-danger text-white">Cancelled</span>;
      default: return <span className="badge bg-danger text-white">Expired</span>;
    }
  };

  return (
    <div className="container-fluid p-0">
      <h4 className="fw-bold mb-4 text-dark">My Booking History</h4>

      {isLoading ? (
        <BookingsListSkeleton />
      ) : bookings && bookings.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => (
            <div key={booking._id} className="card border-0 shadow-sm p-3 hover-transform" style={{ borderRadius: '16px' }}>
              <div className="card-body p-1">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="fw-bold mb-0 text-dark">{booking.service_id?.title || 'Home Service'}</h5>
                    {getStatusBadge(booking.status)}
                  </div>
                  <span className="fw-bold text-success" style={{ fontSize: 16 }}>
                    ₱{booking.total_amount || booking.base_fare}
                  </span>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6 small text-secondary d-flex align-items-center gap-1">
                    <Calendar size={14} /> 
                    <span>Created: {dayjs(booking.created_at).format('MMM DD, YYYY hh:mm A')}</span>
                  </div>
                  <div className="col-12 col-md-6 small text-secondary d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-truncate" />
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                      {booking.formatted_address}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between border-top pt-3">
                  <div className="d-flex align-items-center gap-2">
                    {booking.provider_id ? (
                      <>
                        <div 
                          className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold bg-success"
                          style={{ width: 28, height: 28, fontSize: 12 }}
                        >
                          {booking.provider_id.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="small text-dark fw-bold">{booking.provider_id.name}</span>
                      </>
                    ) : (
                      <span className="small text-muted font-italic">No technician assigned yet</span>
                    )}
                  </div>
                  <Link to={`/bookings/${booking._id}`} className="btn btn-outline-success btn-sm fw-bold px-3 py-1 d-flex align-items-center gap-1">
                    Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <AlertCircle className="text-secondary mx-auto mb-2" size={48} />
          <h5 className="fw-bold text-dark mb-1">No bookings found</h5>
          <p className="text-secondary small">You haven't made any booking requests yet.</p>
        </div>
      )}
    </div>
  );
}
