/**
 * MUI theme
 * @see https://material-ui.com/customization/theming/
 */

import { createTheme } from '@material-ui/core/styles';
import { green, red } from '@material-ui/core/colors';
import { fiFI } from '@material-ui/core/locale';

export const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#00B4A2',
      },
      secondary: {
        main: '#AA4465',
      },
      success: {
        main: green[800],
      },
      error: {
        main: red[800],
      },
    },
    overrides: {
      MuiFormLabel: {
        root: {
          userSelect: 'none',
        },
      },
      MuiFormControlLabel: {
        label: {
          userSelect: 'none',
        },
      },
      MuiTablePagination: {
      caption: {
        userSelect: 'none'
      }        
      },
      MuiStepLabel: {
        label: {
          userSelect: 'none'
        }
      }
    },
  },
  fiFI
);
