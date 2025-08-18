// theme.jsx

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        primary: {
          main: '#000000',
          light: '#333333',
          dark: '#000000',
          contrastText: '#ffffff'
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        text: {
          primary: '#000000',
          secondary: '#333333',
        },
        divider: '#e0e0e0',
        action: {
          hover: 'rgba(0,0,0,0.04)',
          selected: 'rgba(0,0,0,0.08)',
          disabled: 'rgba(0,0,0,0.26)',
          disabledBackground: 'rgba(0,0,0,0.12)',
        },
      }
      : {
        primary: {
          main: '#ffffff',
          light: '#ffffff',
          dark: '#cccccc',
          contrastText: '#000000'
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#cccccc',
        },
        divider: '#424242',
        action: {
          hover: 'rgba(255,255,255,0.08)',
          selected: 'rgba(255,255,255,0.16)',
          disabled: 'rgba(255,255,255,0.3)',
          disabledBackground: 'rgba(255,255,255,0.12)',
        },
      }),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#000000' : '#ffffff',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#000000' : '#ffffff',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#000000' : '#ffffff',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#000000' : '#ffffff',
          '&.Mui-checked': {
            color: mode === 'light' ? '#000000' : '#ffffff',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#000000' : '#ffffff',
          '&.Mui-checked': {
            color: mode === 'light' ? '#000000' : '#ffffff',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: mode === 'light' ? '#000000' : '#ffffff',
        },
        thumb: {
          backgroundColor: mode === 'light' ? '#000000' : '#ffffff',
        },
        track: {
          backgroundColor: mode === 'light' ? '#000000' : '#ffffff',
        },
        rail: {
          backgroundColor: mode === 'light' ? '#e0e0e0' : '#424242',
        },
      },
    },
  },
});
