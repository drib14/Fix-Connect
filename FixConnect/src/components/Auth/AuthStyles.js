import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: var(--bg-dark);
`;

export const FormBox = styled(motion.div)`
  background: var(--bg-card);
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

export const Title = styled.h2`
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 2rem;
`;

export const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  cursor: pointer;

  &:hover {
    color: var(--text-main);
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: var(--primary-hover);
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;

  input[type="checkbox"] {
    accent-color: var(--primary-color);
    width: 18px;
    height: 18px;
  }
`;

export const ErrorMsg = styled.div`
  color: var(--danger);
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-align: center;
`;

export const LinkText = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: var(--text-muted);

  a {
    color: var(--primary-color);
    margin-left: 5px;
  }
`;
