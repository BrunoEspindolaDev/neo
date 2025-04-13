import App from './app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import theme from './theme';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
      <CSSReset />
    </ChakraProvider>
  </StrictMode>
);
