import { createMuiTheme } from '@material-ui/core/styles';
import { BORDER_RADIUS } from './config';

export default createMuiTheme({
  typography: {
    fontFamily: ['DM Sans', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  palette: {
    background: {
      default: '#fff',
      paper: '#fff',
    },
    primary: {
      main: '#006fe9',
    },
    secondary: {
      main: '#d70205',
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
