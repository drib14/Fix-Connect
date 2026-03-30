import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: var(--bg-card);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
    border-color: rgba(76, 175, 80, 0.3);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultIcon = styled.div`
  font-size: 5rem;
  color: var(--text-muted);
`;

const Content = styled.div`
  padding: 20px;
`;

const Name = styled.h3`
  font-size: 1.4rem;
  color: var(--text-main);
  margin-bottom: 5px;
`;

const Category = styled.span`
  display: inline-block;
  padding: 5px 10px;
  background: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 15px;
`;

const Description = styled.p`
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 15px;
`;

const JobsList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 15px;
  max-height: 60px;
  overflow: hidden;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
`;

const Rating = styled.div`
  color: var(--accent);
  font-weight: bold;
`;

const ContactBtn = styled.button`
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

const WorkerCard = ({ worker, onClick }) => {
  return (
    <Card onClick={() => onClick(worker)}>
      <ImageContainer>
        {worker.imageUrl ? (
          <Image
            src={worker.imageUrl}
            alt={worker.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <DefaultIcon style={{ display: worker.imageUrl ? 'none' : 'block' }}>
          👤
        </DefaultIcon>
      </ImageContainer>
      <Content>
        <Name>{worker.name}</Name>
        <Category>{worker.category}</Category>
        <Description>{worker.description}</Description>
        {worker.jobsOffered && worker.jobsOffered.length > 0 && (
          <JobsList>
            {worker.jobsOffered.slice(0, 3).map((job, idx) => (
              <li key={idx}>{job}</li>
            ))}
            {worker.jobsOffered.length > 3 && <li>...and more</li>}
          </JobsList>
        )}
        <Footer>
          <Rating>★ {worker.rating}</Rating>
          <ContactBtn>Hire Me</ContactBtn>
        </Footer>
      </Content>
    </Card>
  );
};

export default WorkerCard;
