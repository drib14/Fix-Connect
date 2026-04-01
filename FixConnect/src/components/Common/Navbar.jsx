import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Home, Users, Briefcase, LayoutDashboard, User, LogOut } from 'lucide-react';

const NavContainer = styled(motion.nav)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background: rgba(18, 18, 18, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--bg-card);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 1px;

  img {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 30px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

const NavLink = styled(Link)`
  color: var(--text-main);
  font-weight: 500;
  font-size: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }

  &:hover:after {
    width: 100%;
  }

  span {
    display: inline;
  }

  svg {
    display: none;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
    svg {
      display: inline;
      width: 24px;
      height: 24px;
      color: var(--primary-color);
    }
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    .hide-on-mobile {
      display: none;
    }
  }
`;

const Button = styled(Link)`
  padding: 8px 20px;
  border-radius: 5px;
  font-weight: 600;
  border: 1px solid var(--primary-color);
  transition: all 0.3s ease;

  &.login {
    background: transparent;
    color: var(--primary-color);
    &:hover {
      background: rgba(76, 175, 80, 0.1);
    }
  }

  &.register {
    background: var(--primary-color);
    color: #fff;
    &:hover {
      background: var(--primary-hover);
    }
  }
`;

const Navbar = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <NavContainer initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <Logo to="/">
        <div style={{ width: '40px', height: '40px', position: 'relative' }}>
          {/* Simple 3D CSS representation or keep icon if desired, returning 3D Mascot is too complex here, let's just make the image have 3D effect */}
          <img src="/FC-logo.png" alt="FixConnect Logo" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))', transform: 'perspective(100px) rotateY(-10deg) rotateX(10deg)' }} />
        </div>
        <span>FixConnect</span>
      </Logo>
      <NavLinks>
        <NavLink to="/"><Home /><span>Home</span></NavLink>
        <NavLink to="/workers"><Users /><span>Workers</span></NavLink>
        <NavLink to="/book"><Briefcase /><span>Book Service</span></NavLink>
        <NavLink to="/dashboard"><LayoutDashboard /><span>Dashboard</span></NavLink>
      </NavLinks>
      <AuthButtons>
        {token ? (
          <>
            <NavLink to="/profile" style={{ marginRight: '10px' }}>
              <User /><span>Profile</span>
            </NavLink>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#f44336' }}>
              <LogOut width={24} height={24} />
              <span className="hide-on-mobile" style={{ fontWeight: '500', fontSize: '1rem' }}>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Button to="/login" className="login">Log In</Button>
            <Button to="/register" className="register">Sign Up</Button>
          </>
        )}
      </AuthButtons>
    </NavContainer>
  );
};

export default Navbar;
