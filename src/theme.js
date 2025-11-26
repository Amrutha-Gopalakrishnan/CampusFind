import { createTheme } from '@mui/material/styles';

// Brand Color Palette
const colors = {
  primary: '#6C63FF',        // Soft Indigo
  secondary: '#4E54C8',       // Calm Blue-Purple
  background: '#F9FAFB',      // Background
  textPrimary: '#1F2937',    // Text Primary
  textSecondary: '#6B7280',   // Text Secondary
  accent: '#C084FC',          // Subtle Lilac Highlight
  success: '#16A34A',          // Success
  error: '#DC2626',           // Error
};

// Create MUI theme
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: '#8B85FF',
      dark: '#4E47CC',
    },
    secondary: {
      main: colors.secondary,
      light: '#6B73E8',
      dark: '#3A41A8',
    },
    background: {
      default: colors.background,
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    success: {
      main: colors.success,
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Inter, Poppins',
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'Inter, Poppins',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: 'Inter, Poppins',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: 'Nunito, Rubik',
      fontWeight: 400,
      fontSize: '1rem',
    },
    body2: {
      fontFamily: 'Nunito, Rubik',
      fontWeight: 400,
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: 'Inter, Poppins',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Export colors for Tailwind usage
export const brandColors = colors;

