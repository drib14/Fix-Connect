import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import WorkerCTA from './WorkerCTA';

const Main = styled.main`
  min-height: calc(100vh - 80px); /* Adjust based on navbar height */
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Main>{children}</Main>
      <WorkerCTA />
    </>
  );
};

export default PageLayout;
