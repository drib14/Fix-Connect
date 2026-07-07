import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { 
  Sparkles, Water, Flash, Snow, Hammer, Bug, HelpCircle, 
  Clock, ArrowLeft, AlertCircle
} from 'lucide-react';
import { ServicesGridSkeleton } from '../../components/SkeletalLoader';

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data.services || [];
    }
  });

  const categories = [
    { slug: 'cleaning', label: 'Cleaning', icon: Sparkles },
    { slug: 'plumbing', label: 'Plumbing', icon: Water },
    { slug: 'electrical', label: 'Electrical', icon: Flash },
    { slug: 'appliance_repair', label: 'Appliances', icon: Snow },
    { slug: 'carpentry', label: 'Carpentry', icon: Hammer },
    { slug: 'pest_control', label: 'Pest Control', icon: Bug },
    { slug: 'general_handyman', label: 'Handyman', icon: HelpCircle },
  ];

  // Filter services based on activeCategory
  const filteredServices = activeCategory 
    ? services?.filter(s => s.category === activeCategory) 
    : services;

  const handleCategorySelect = (slug) => {
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/home" className="btn btn-light rounded-circle p-2 border hover-bg-light">
          <ArrowLeft size={18} className="text-secondary" />
        </Link>
        <h4 className="fw-bold mb-0 text-dark">Service Catalog</h4>
      </div>

      {/* Filter Categories Chips */}
      <div className="d-flex gap-2 overflow-auto pb-3 mb-4 scrollbar-none" style={{ whiteSpace: 'nowrap' }}>
        <button 
          className={`btn px-4 py-2 rounded-pill fw-bold border ${!activeCategory ? 'btn-success text-white' : 'btn-white bg-white text-secondary'}`}
          onClick={() => setSearchParams({})}
        >
          All Offerings
        </button>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              className={`btn px-4 py-2 rounded-pill fw-bold border d-flex align-items-center gap-2 ${isSelected ? 'btn-success text-white' : 'btn-white bg-white text-secondary'}`}
              onClick={() => handleCategorySelect(cat.slug)}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Services List Grid */}
      {isLoading ? (
        <ServicesGridSkeleton />
      ) : filteredServices && filteredServices.length > 0 ? (
        <div className="row g-4 row-cols-1 row-cols-md-3">
          {filteredServices.map((svc) => (
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
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <AlertCircle className="text-secondary mx-auto mb-2" size={48} />
          <h5 className="fw-bold text-dark mb-1">No services found</h5>
          <p className="text-secondary small mb-0">No active services match this category.</p>
        </div>
      )}
    </div>
  );
}
