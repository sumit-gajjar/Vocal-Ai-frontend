// src/config.js
const config = {
    baseUrl: process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_PROD_BASE_URL
      : process.env.REACT_APP_DEV_BASE_URL,
    environment: process.env.NODE_ENV,
  };
  
  export default config;
  