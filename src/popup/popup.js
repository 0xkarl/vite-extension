import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';

import App from './components/global/App';
import { ViteProvider } from './contexts/Vite';
import theme from './utils/theme';
import './popup.css';

render(
  <StrictMode>
    <ThemeProvider {...{ theme }}>
      <CssBaseline />

      <ViteProvider>
        <HashRouter basename="/popup.html">
          <App />
        </HashRouter>
      </ViteProvider>
    </ThemeProvider>
  </StrictMode>,
  document.getElementById('root')
);
