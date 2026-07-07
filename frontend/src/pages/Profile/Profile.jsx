import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../utils/api';
import { updateUser } from '../../store/authSlice';
import { User, Phone, Mail, Globe, BadgeDollarSign, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  phone: z.string().min(7, 'Phone number is required.'),
});

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      dispatch(updateUser(response.data.user));
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <h4 className="fw-bold mb-4 text-dark">My Profile Settings</h4>

      <div className="row g-4">
        {/* Profile Card Summary */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 text-center h-100" style={{ borderRadius: '16px' }}>
            <div 
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-3 bg-success"
              style={{ width: 80, height: 80, fontSize: 32 }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <span className="badge bg-success bg-opacity-10 text-success text-uppercase fw-bold mb-4" style={{ fontSize: 10 }}>
              {user?.role || 'Customer'}
            </span>

            <div className="text-start border-top pt-3">
              <div className="mb-2 small text-secondary d-flex align-items-center gap-2">
                <Mail size={16} /> <span>{user?.email}</span>
              </div>
              <div className="mb-2 small text-secondary d-flex align-items-center gap-2">
                <Globe size={16} /> <span>{user?.country || 'Philippines'}</span>
              </div>
              <div className="small text-secondary d-flex align-items-center gap-2">
                <BadgeDollarSign size={16} /> <span>Currency: {user?.currency || 'PHP'} ({user?.currency_symbol || '₱'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form Column */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '16px' }}>
            <h6 className="fw-bold text-dark mb-3">Edit Personal Details</h6>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <User size={16} className="text-secondary" />
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 bg-light ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your name"
                    {...register('name')}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name.message}</div>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="form-label small fw-semibold">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Phone size={16} className="text-secondary" />
                  </span>
                  <input
                    type="text"
                    className={`form-control border-start-0 bg-light ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="Enter phone number"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone.message}</div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button 
                type="submit" 
                className="btn btn-success w-100 py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Save Profile Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
