import { createTheme } from '@mui/material/styles';

// PMC Brand palette
const PMC_GREEN      = '#385246';
const PMC_GREEN_DARK = '#2A3D33';
const PMC_GREEN_LITE = '#46614F';
const PMC_ACCENT     = '#9BC7AE';
const PMC_BG_CREAM   = '#DAD7B9';

const theme = createTheme({
  palette: {
    primary:    { main: PMC_GREEN, dark: PMC_GREEN_DARK, light: PMC_GREEN_LITE, contrastText: '#fff' },
    secondary:  { main: PMC_ACCENT, contrastText: PMC_GREEN_DARK },
    background: { default: PMC_BG_CREAM, paper: '#ffffff' },
    success:    { main: '#10B981' },
    text:       { primary: '#1a2e25', secondary: '#4B5563' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: PMC_GREEN,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PMC_GREEN} 0%, ${PMC_GREEN_LITE} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${PMC_GREEN_DARK} 0%, ${PMC_GREEN} 100%)`,
          },
        },
      },
    },
    MuiPaper:  { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard:   { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default theme;
