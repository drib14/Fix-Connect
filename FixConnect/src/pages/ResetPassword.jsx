import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Mail, Lock, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export default function ResetPassword() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/reset-password', formData);
      setSuccess('Password successfully reset!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset password</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter the OTP sent to your email and choose a new password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">{error}</div>}
          {success && <div className="p-3 text-sm text-primary-foreground bg-primary/90 rounded-md">{success}</div>}

          <div className="space-y-2 relative">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="m@example.com" className="pl-9 bg-background/50 border-border/50 focus:bg-background" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="otp">6-Digit OTP</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="otp" type="text" placeholder="123456" className="pl-9 bg-background/50 border-border/50 focus:bg-background tracking-widest font-mono" value={formData.otp} onChange={handleChange} maxLength={6} required />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" className="pl-9 bg-background/50 border-border/50 focus:bg-background" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="confirmPassword" type="password" className="pl-9 bg-background/50 border-border/50 focus:bg-background" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/25" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset Password
          </Button>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-muted-foreground hover:text-primary transition-colors">
              Return to Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}