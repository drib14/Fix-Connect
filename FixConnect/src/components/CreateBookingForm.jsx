import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Wallet, CreditCard } from 'lucide-react';

export function CreateBookingForm({ onSuccess, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    serviceCategory: '',
    date: '',
    startTime: '',
    endTime: '',
    address: '',
    paymentMethod: 'Cash',
    lat: 14.5995, // Mock default coordinates (Manila)
    lng: 120.9842
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/workers/categories');
            if (res.data.success && res.data.data.length > 0) {
                setCategories(res.data.data);
                setFormData(prev => ({ ...prev, serviceCategory: res.data.data[0] }));
            } else {
                // Fallback categories if db is empty
                const fallbacks = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning'];
                setCategories(fallbacks);
                setFormData(prev => ({ ...prev, serviceCategory: fallbacks[0] }));
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
            const fallbacks = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning'];
            setCategories(fallbacks);
            setFormData(prev => ({ ...prev, serviceCategory: fallbacks[0] }));
        }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handlePaymentSelect = (method) => setFormData({ ...formData, paymentMethod: method });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/bookings', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        if (res.data.data.paymentUrl) {
            window.location.href = res.data.data.paymentUrl;
        } else {
            onSuccess(res.data.data);
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-4 pb-4">
      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="serviceCategory">Service Category</Label>
        <select
            id="serviceCategory"
            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            value={formData.serviceCategory}
            onChange={handleChange}
            required
        >
          {categories.map(cat => (
              <option key={cat} value={cat} className="bg-background">{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={formData.date} onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Service Address</Label>
        <Input id="address" placeholder="123 Main St, City" value={formData.address} onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary" required />
      </div>

      <div className="space-y-3 pt-2">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => handlePaymentSelect('Cash')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.paymentMethod === 'Cash'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:bg-card'
                }`}
            >
                <Wallet className="h-6 w-6" />
                <span className="text-sm font-medium">Cash on Site</span>
            </button>
            <button
                type="button"
                onClick={() => handlePaymentSelect('PayMongo')}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.paymentMethod === 'PayMongo'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-border/50 bg-card/50 text-muted-foreground hover:border-border hover:bg-card'
                }`}
            >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm font-medium">Pay Online</span>
            </button>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25" disabled={loading}>
          {loading ? 'Processing...' : 'Confirm Booking'}
        </Button>
      </div>
    </form>
  );
}
