import App from './app';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider>
      <App />
      <CSSReset />
    </ChakraProvider>
  </StrictMode>
);
