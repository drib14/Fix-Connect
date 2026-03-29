import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
`;

const Input = styled.input`
  width: 45px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.2);
  }
`;

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow pasting
    if (value.length > 1) {
      const pastedData = value.slice(0, length).split('');
      pastedData.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const focusIndex = Math.min(index + pastedData.length, length - 1);
      inputsRef.current[focusIndex].focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }

    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <Container>
      {otp.map((data, index) => (
        <Input
          key={index}
          type="text"
          maxLength={length}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(ref) => (inputsRef.current[index] = ref)}
        />
      ))}
    </Container>
  );
};

export default OtpInput;
