import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { 
  Sparkles, Water, Flash, Snow, Hammer, ColorPalette, Bug, HelpCircle, 
  MapPin, Clock, Calendar, ChevronRight, Star, AlertCircle
} from 'lucide-react';
import { ServicesGridSkeleton, BannerSkeleton } from '../../components/SkeletalLoader';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();

  // Fetch all active services
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data.services || [];
    }
  });

  // Fetch active booking status
  const { data: activeBooking, isLoading: loadingActive } = useQuery({
    queryKey: ['activeBooking'],
    queryFn: async () => {
      const res = await api.get('/bookings/active');
      return res.data.booking || null;
    },
    refetchInterval: 10000, // Poll every 10 seconds for real-time status changes
  });

  const categories = [
    { slug: 'cleaning', label: 'Cleaning', icon: Sparkles, color: '#E8F5E9', text: '#2E7D32' },
    { slug: 'plumbing', label: 'Plumbing', icon: Water, color: '#E3F2FD', text: '#1565C0' },
    { slug: 'electrical', label: 'Electrical', icon: Flash, color: '#FFFDE7', text: '#F57F17' },
    { slug: 'appliance_repair', label: 'Appliances', icon: Snow, color: '#EDE7F6', text: '#673AB7' },
    { slug: 'carpentry', label: 'Carpentry', icon: Hammer, color: '#efebe9', text: '#5d4037' },
    { slug: 'pest_control', label: 'Pest Control', icon: Bug, color: '#FCE4EC', text: '#C2185B' },
    { slug: 'general_handyman', label: 'Handyman', icon: HelpCircle, color: '#ECEFF1', text: '#37474F' },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-secondary text-white';
      case 'SEARCHING': return 'bg-warning text-dark animate-pulse';
      case 'ACCEPTED': return 'bg-info text-white';
      case 'IN_PROGRESS': return 'bg-primary text-white';
      case 'COMPLETED': return 'bg-success text-white';
      default: return 'bg-danger text-white';
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Active Booking Banner */}
      {!loadingActive && activeBooking && (
        <div className="card border-0 shadow-sm mb-4 text-white position-relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #1b5e20 0%, #2E7D32 100%)', borderRadius: '16px' }}>
          <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <span className="badge bg-warning text-dark fw-bold mb-2">ACTIVE REQUEST</span>
                <h4 className="fw-bold mb-1">{activeBooking.service_id?.title || 'Home Service'}</h4>
                <p className="small mb-3 text-white-50 d-flex align-items-center gap-1">
                  <MapPin size={14} /> {activeBooking.formatted_address}
                </p>
                <div className="d-flex align-items-center gap-3">
                  <span className="small d-flex align-items-center gap-1 text-light">
                    <Clock size={14} /> Status: <strong className="text-warning">{activeBooking.status}</strong>
                  </span>
                </div>
              </div>
              <Link to={`/bookings/${activeBooking._id}`} className="btn btn-warning py-2 px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                Track Request <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          {/* Decorative Background Circles */}
          <div className="position-absolute rounded-circle bg-white bg-opacity-5" style={{ width: 250, height: 250, top: -50, right: -50 }} />
        </div>
      )}

      {/* Categories Horizontal Grid */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold text-dark mb-0">Browse Categories</h5>
          <Link to="/categories" className="text-success text-decoration-none small fw-bold">View All</Link>
        </div>
        <div className="row g-3 row-cols-3 row-cols-md-7">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.slug} className="col">
                <Link 
                  to={`/categories?category=${cat.slug}`}
                  className="card border-0 shadow-sm text-center p-3 h-100 text-decoration-none hover-transform"
                  style={{ backgroundColor: '#ffffff', borderRadius: '12px' }}
                >
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 text-success"
                    style={{ width: 48, height: 48, backgroundColor: cat.color, color: cat.text }}
                  >
                    <Icon size={24} />
                  </div>
                  <span className="small fw-bold text-dark text-truncate d-block">{cat.label}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services Catalog */}
      <div className="mb-4">
        <h5 className="fw-bold text-dark mb-3">Popular Home Services</h5>
        {loadingServices ? (
          <ServicesGridSkeleton />
        ) : servicesData && servicesData.length > 0 ? (
          <div className="row g-4 row-cols-1 row-cols-md-3">
            {servicesData.map((svc) => (
              <div key={svc._id} className="col">
                <div className="card h-100 border-0 shadow-sm hover-transform" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge bg-success bg-opacity-10 text-success text-uppercase fw-bold" style={{ fontSize: 10 }}>
                        {svc.category.replace('_', ' ')}
                      </span>
                      <span className="fw-bold text-success" style={{ fontSize: 18 }}>
                        ₱{svc.base_rate}
                        <small className="text-secondary small fw-normal" style={{ fontSize: 11 }}>
                          /{svc.rate_type === 'hourly' ? 'hr' : svc.rate_type === 'per_visit' ? 'visit' : 'fix'}
                        </small>
                      </span>
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2">{svc.title}</h5>
                    <p className="card-text text-secondary small flex-grow-1">{svc.description}</p>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <Clock size={14} /> Est: {svc.estimated_duration} mins
                      </span>
                    </div>
                    <Link to={`/book/${svc._id}`} className="btn btn-success w-100 py-2 fw-bold text-white shadow-sm mt-auto">
                      Book Service
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <AlertCircle className="text-secondary mx-auto mb-2" size={36} />
            <p className="text-secondary mb-0">No services available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
