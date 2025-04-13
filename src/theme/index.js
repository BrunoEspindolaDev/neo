import { extendTheme } from '@chakra-ui/react';

import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-sans/700.css';

const theme = extendTheme({
  fonts: {
    heading: `'Geist Sans', sans-serif`,
    body: `'Geist Sans', sans-serif`
  },
  colors: {
    green: {
      50: '#e0fff5',
      100: '#b8ffe3',
      200: '#8fffd1',
      300: '#66ffbf',
      400: '#3dffad',
      500: '#09F886',
      600: '#07c96c',
      700: '#059a52',
      800: '#036b38',
      900: '#013d1e'
    },
    gray: {
      50: '#f9fafb',
      100: '#f0f1f3',
      200: '#d9dbe0',
      300: '#c2c5cd',
      400: '#a6aab6',
      500: '#8a8f9f',
      600: '#6e7488',
      700: '#525869',
      800: '#36394a',
      900: '#1a1c2b'
    }
  }
});

export default theme;
