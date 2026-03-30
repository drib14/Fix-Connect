import React from 'react';
import styled from 'styled-components';
import PageLayout from '../components/Common/PageLayout';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: var(--bg-card);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 30px;
  text-align: center;
  border-bottom: 2px solid rgba(255,255,255,0.1);
  padding-bottom: 20px;
`;

const SectionTitle = styled.h2`
  color: var(--accent);
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const Text = styled.p`
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: 15px;
  font-size: 1.05rem;
`;

const Terms = () => {
  return (
    <PageLayout>
      <Container
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Terms and Privacy Policy</Title>

        <SectionTitle>1. Introduction</SectionTitle>
        <Text>
          Welcome to FixConnect. These Terms and Conditions govern your use of our website and services. By accessing or using the FixConnect platform, you agree to be bound by these terms. If you disagree with any part of these terms, please do not use our services.
        </Text>

        <SectionTitle>2. Privacy and Data Collection</SectionTitle>
        <Text>
          Your privacy is critically important to us. FixConnect collects personal information such as your email address and precise location (e.g., Region, Province, City) during the registration process. This information is securely stored and utilized solely to facilitate the connection between clients and skilled professionals in your area.
        </Text>

        <SectionTitle>3. User Conduct</SectionTitle>
        <Text>
          You agree to use FixConnect only for lawful purposes. You must not use the platform in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of FixConnect. Fraudulent activities, spam, or harassment of skilled workers or clients will result in immediate termination of your account.
        </Text>

        <SectionTitle>4. Liability</SectionTitle>
        <Text>
          FixConnect acts as a bridge between you and skilled professionals. We are not liable for the quality of work provided by the professionals nor any disputes that may arise between users. We strongly recommend users to communicate clearly and verify credentials before commencing any work.
        </Text>

        <SectionTitle>5. Modifications</SectionTitle>
        <Text>
          FixConnect reserves the right to revise these Terms and Privacy Policy at any time. We will notify you of any changes by posting the new terms on this page. Your continued use of the platform after changes have been posted constitutes your acceptance of the revised terms.
        </Text>

      </Container>
    </PageLayout>
  );
};

export default Terms;
