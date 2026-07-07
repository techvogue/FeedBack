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
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16, // Standardize to 16px (matches MUI borderRadius 2 in some setups, but explicit here)
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8, // Standardize buttons to 8px
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
