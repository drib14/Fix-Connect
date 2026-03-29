import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #4CAF50;
    --primary-hover: #45a049;
    --bg-dark: #121212;
    --bg-darker: #0a0a0a;
    --bg-card: #1e1e1e;
    --text-main: #ffffff;
    --text-muted: #b3b3b3;
    --accent: #FF9800;
    --danger: #f44336;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
    line-height: 1.6;
    overflow-x: hidden;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  a:hover {
    color: var(--primary-hover);
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  /* Skeleton Loading Animation */
  @keyframes skeleton-loading {
    0% { background-color: #2a2a2a; }
    100% { background-color: #3f3f3f; }
  }

  .skeleton {
    animation: skeleton-loading 1s linear infinite alternate;
    border-radius: 4px;
  }

  .skeleton-text {
    width: 100%;
    height: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }

  .skeleton-img {
    width: 100%;
    height: 200px;
  }
`;
