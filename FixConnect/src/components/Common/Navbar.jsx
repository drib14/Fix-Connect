import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 1px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 30px;
`;

const NavLink = styled(Link)`
  color: var(--text-main);
  font-weight: 500;
  font-size: 1rem;
  position: relative;

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
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 15px;
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
  return (
    <NavContainer initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
      <Logo to="/">FixConnect</Logo>
      <NavLinks>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/workers">Workers</NavLink>
      </NavLinks>
      <AuthButtons>
        <Button to="/login" className="login">Log In</Button>
        <Button to="/register" className="register">Sign Up</Button>
      </AuthButtons>
    </NavContainer>
  );
};

export default Navbar;
