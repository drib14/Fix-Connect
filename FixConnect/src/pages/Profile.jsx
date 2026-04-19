import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Loader2, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFormData({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || ''
      });
      if (res.data.avatar) {
          setAvatarPreview(res.data.avatar);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
        const token = localStorage.getItem('token');
        const form = new FormData();
        // Since original backend expect name, we will just pass nothing if we only want avatar
        // or we could map firstName and lastName if the endpoint supported it.
        // We will just upload avatar for now.
        if (avatarFile) {
            form.append('avatar', avatarFile);
        }

        await axios.put('/api/users/profile', form, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        setMessage('Profile updated successfully!');
        await fetchProfile();
    } catch (err) {
        console.error('Failed to update profile', err);
        setMessage('Failed to update profile');
    } finally {
        setSaving(false);
    }
  };

  if (loading) return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
  );

  const getInitials = () => {
      if (!user) return 'FC';
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background dark text-foreground p-6 sm:p-8 flex flex-col items-center">
      {/* Simple Nav Back */}
      <nav className="w-full max-w-2xl mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>&larr; Back to Dashboard</Button>
          <span className="font-bold text-lg">My Profile</span>
      </nav>

      <div className="w-full max-w-2xl bg-card/40 border border-border/50 rounded-2xl p-8 backdrop-blur-sm">
          {message && (
              <div className={`p-4 rounded-md mb-6 text-sm ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {message}
              </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                          {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-4xl font-bold text-emerald-500">{getInitials()}</span>
                          )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-3 bg-emerald-600 rounded-full text-white shadow-lg hover:bg-emerald-700 transition-colors"
                      >
                          <Camera size={18} />
                      </button>
                      <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                      />
                  </div>
                  <p className="text-sm text-muted-foreground">Click the camera icon to upload a photo</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={formData.firstName} disabled className="bg-background/50 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={formData.lastName} disabled className="bg-background/50 text-muted-foreground" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                      <Label>Email</Label>
                      <Input value={user.email} disabled className="bg-background/50 text-muted-foreground" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                      <Label>Role</Label>
                      <Input value={user.role.toUpperCase()} disabled className="bg-background/50 text-muted-foreground" />
                  </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end">
                  <Button type="submit" disabled={saving || !avatarFile} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Profile
                  </Button>
              </div>
          </form>
      </div>
    </div>
  );
}
