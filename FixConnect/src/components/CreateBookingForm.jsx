import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function CreateBookingForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    serviceCategory: 'Plumbing',
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

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
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="serviceCategory">Service Category</Label>
        <select
            id="serviceCategory"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.serviceCategory}
            onChange={handleChange}
        >
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Cleaning">Cleaning</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="123 Main St, City" value={formData.address} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select
            id="paymentMethod"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={formData.paymentMethod}
            onChange={handleChange}
        >
          <option value="Cash">Cash</option>
          <option value="PayMongo">Online Payment (PayMongo)</option>
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="w-full font-semibold" disabled={loading}>
          {loading ? 'Creating...' : 'Book Now'}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
