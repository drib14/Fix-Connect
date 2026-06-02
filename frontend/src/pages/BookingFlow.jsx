import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createBooking, clearCurrentBooking } from '../store/bookingSlice.js';
import { ArrowLeft, Navigation, FileText, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const BookingFlow = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const { accessToken, user } = useSelector((state) => state.auth);
  const { loading, activeBooking: currentBooking, error } = useSelector((state) => state.bookings);
  const { selected: selectedCurrency } = useSelector((state) => state.currency);

  const [serviceRequestText, setServiceRequestText] = useState(query);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(user?.location?.address || '');

  useEffect(() => {
    dispatch(clearCurrentBooking());
  }, [dispatch]);

  // If a booking is successfully created, redirect to finding/tracking view
  useEffect(() => {
    if (currentBooking && !loading) {
      toast.success('Service requested instantly!');
      navigate(`/booking/${currentBooking.id || currentBooking._id}`);
    }
    if (error) toast.error(error);
  }, [currentBooking, error, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceRequestText.trim()) {
      toast.error('Please specify what service you need.');
      return;
    }
    await dispatch(createBooking({
      token: accessToken,
      data: {
        serviceRequestText,
        description: description || serviceRequestText,
        address: { formatted: address },
        currency: selectedCurrency,
      },
    }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ border: 'none', padding: '0', marginBottom: '1.5rem', background: 'none', gap: '0.4rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{
        background: 'white', border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)'
      }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Instant Service Request
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Describe what you need, and we'll instantly broadcast it to verified professionals nearby.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="form-group">
            <label className="form-label"><Search size={16} /> Service Need (Required)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Fix my leaking sink"
              value={serviceRequestText}
              onChange={(e) => setServiceRequestText(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label"><FileText size={16} /> Extra Details / Problem Description (Optional)</label>
            <textarea
              className="form-input"
              placeholder="Provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label"><Navigation size={16} /> Service Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Where do you need this service?"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !serviceRequestText.trim() || !address.trim()}
            style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'white' }} /> Finding Workers...</>
            ) : (
              <><Check size={20} /> Request Now</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingFlow;
