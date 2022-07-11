import { createMuiTheme } from '@material-ui/core/styles';
import { BORDER_RADIUS } from './config';

export default createMuiTheme({
  typography: {
    fontFamily: ['Metropolis', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    type: 'dark',
    background: {
      default: '#000000',
      paper: '#111111',
    },
    primary: {
      main: '#ff8f8f',
    },
    secondary: {
      main: '#e42f34',
    },
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: BORDER_RADIUS,
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: BORDER_RADIUS,
      },
    },
    MuiDialog: {
      paper: {
        borderRadius: BORDER_RADIUS,
      },
    },
  },
});
