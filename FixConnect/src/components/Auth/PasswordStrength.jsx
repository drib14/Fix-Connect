import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  margin-top: 10px;
  width: 100%;
`;

const BarContainer = styled.div`
  height: 6px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
  display: flex;
  gap: 2px;
`;

const BarSegment = styled(motion.div)`
  height: 100%;
  flex: 1;
`;

const Label = styled.div`
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: right;
`;

const checkStrength = (pass) => {
  let score = 0;
  if (!pass) return score;
  if (pass.length > 5) score += 1;
  if (pass.length > 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return score; // Max 5
};

const getColors = (score) => {
  if (score === 0) return ['transparent', 'transparent', 'transparent'];
  if (score <= 2) return ['#f44336', 'transparent', 'transparent'];
  if (score <= 4) return ['#FFEB3B', '#FFEB3B', 'transparent'];
  return ['#4CAF50', '#4CAF50', '#4CAF50'];
};

const PasswordStrength = ({ password }) => {
  const score = checkStrength(password);
  const colors = getColors(score);

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const textLabel = score > 0 ? labels[score - 1] : '';

  return (
    <Container>
      <BarContainer>
        {[0, 1, 2].map((i) => (
          <BarSegment
            key={i}
            initial={{ backgroundColor: 'transparent' }}
            animate={{ backgroundColor: colors[i] }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </BarContainer>
      <Label>{textLabel}</Label>
    </Container>
  );
};

export default PasswordStrength;
