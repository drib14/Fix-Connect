import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { ArrowLeft, Clock, Shield, Award, Calendar, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const res = await api.get(`/services/${id}`);
      return res.data.service || null;
    }
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ height: '300px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading service...</span>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container text-center py-5">
        <h5 className="text-danger fw-bold">Service Not Found</h5>
        <p className="text-secondary small">The requested service could not be loaded.</p>
        <Link to="/home" className="btn btn-success mt-3">Back Home</Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle p-2 border hover-bg-light">
          <ArrowLeft size={18} className="text-secondary" />
        </button>
        <h4 className="fw-bold mb-0 text-dark">Service Details</h4>
      </div>

      {/* Main Details Card */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
        <span className="badge bg-success bg-opacity-10 text-success text-uppercase fw-bold align-self-start mb-3" style={{ fontSize: 11 }}>
          {service.category.replace('_', ' ')}
        </span>
        <h2 className="fw-bold text-dark mb-3">{service.title}</h2>
        <p className="text-secondary mb-4" style={{ fontSize: 16, lineHeight: 1.6 }}>{service.description}</p>

        {/* Pricing Info */}
        <div className="p-3 bg-light rounded d-flex align-items-center justify-content-between mb-4">
          <div>
            <span className="text-secondary small d-block">Base Service Fee</span>
            <strong className="text-success fs-3">₱{service.base_rate}</strong>
          </div>
          <span className="badge bg-secondary text-white text-capitalize py-2 px-3 fw-bold">
            Rate: {service.rate_type.replace('_', ' ')}
          </span>
        </div>

        {/* Meta Grid */}
        <div className="row g-3 text-center mb-4">
          <div className="col-6 col-md-3">
            <div className="p-3 border rounded h-100">
              <Clock className="text-success mb-2" size={24} />
              <span className="d-block text-secondary small">Est. Duration</span>
              <strong className="text-dark small">{service.estimated_duration} Mins</strong>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 border rounded h-100">
              <Shield className="text-success mb-2" size={24} />
              <span className="d-block text-secondary small">Insurance</span>
              <strong className="text-dark small">Fully Covered</strong>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 border rounded h-100">
              <Award className="text-success mb-2" size={24} />
              <span className="d-block text-secondary small">Quality</span>
              <strong className="text-dark small">Guaranteed</strong>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-3 border rounded h-100">
              <Sparkles className="text-success mb-2" size={24} />
              <span className="d-block text-secondary small">Clean Up</span>
              <strong className="text-dark small">Included</strong>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link to={`/book/${service._id}`} className="btn btn-success btn-lg w-100 py-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2">
          Proceed to Booking Form
        </Link>
      </div>
    </div>
  );
}
