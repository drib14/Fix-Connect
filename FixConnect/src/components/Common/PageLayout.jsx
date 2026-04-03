import React from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';

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
    </>
  );
};

export default PageLayout;
