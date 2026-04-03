import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';
import PageLayout from '../components/Common/PageLayout';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
`;

const ProfileCard = styled(motion.div)`
  background: var(--bg-card);
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 30px;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 3px solid var(--primary-color);
  cursor: pointer;

  &:hover::after {
    content: 'Change';
    position: absolute;
    bottom: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    text-align: center;
    font-size: 0.8rem;
    padding: 5px 0;
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarIcon = styled.div`
  font-size: 3rem;
  color: var(--text-muted);
`;

const FileInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 5px;
`;

const Subtitle = styled.p`
  color: var(--text-muted);
`;

const Form = styled.form`
  display: grid;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const Input = styled.input`
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled(motion.div)`
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  background: ${props => props.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  color: ${props => props.success ? '#4CAF50' : '#f44336'};
  border: 1px solid ${props => props.success ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'};
`;

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/users/profile');
        setUser({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          avatar: response.data.avatar || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
        setStatus({ type: 'error', message: 'Failed to load profile data.' });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Image size must be less than 5MB.' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('phone', user.phone);
      formData.append('address', user.address);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(prev => ({
        ...prev,
        ...response.data
      }));
      setStatus({ type: 'success', message: 'Profile updated successfully!' });

      // Update local storage name if it's there
      localStorage.setItem('userName', response.data.name);

    } catch (error) {
      console.error('Failed to update profile', error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLayout><Container>Loading profile...</Container></PageLayout>;
  }

  // user.avatar is now a full Cloudinary URL
  const displayAvatar = previewUrl || user.avatar || null;

  return (
    <PageLayout>
      <Container>
        <ProfileCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Header>
            <AvatarContainer onClick={() => fileInputRef.current.click()}>
              {displayAvatar ? (
                <AvatarImage src={displayAvatar} alt="Profile" />
              ) : (
                <AvatarIcon>👤</AvatarIcon>
              )}
            </AvatarContainer>
            <FileInput
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
            <ProfileInfo>
              <Title>My Profile</Title>
              <Subtitle>Manage your account settings and personal information</Subtitle>
            </ProfileInfo>
          </Header>

          <AnimatePresence>
            {status.message && (
              <StatusMessage
                success={status.type === 'success'}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {status.message}
              </StatusMessage>
            )}
          </AnimatePresence>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Email (Cannot be changed)</Label>
              <Input type="email" value={user.email} disabled />
            </InputGroup>

            <InputGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                placeholder="Juan Dela Cruz"
              />
            </InputGroup>

            <InputGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                placeholder="09XXXXXXXXX"
              />
            </InputGroup>

            <InputGroup>
              <Label>Complete Address</Label>
              <Textarea
                name="address"
                value={user.address}
                onChange={handleInputChange}
                placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
              />
            </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </ProfileCard>
      </Container>
    </PageLayout>
  );
};

export default Profile;
