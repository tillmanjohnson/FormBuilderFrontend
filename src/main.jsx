import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.jsx';

// 1. Import your converted theme primitives (colors, typography)
import { getDesignTokens } from './theme/themePrimitives.js'; // <-- Adjust path if needed

// 2. Import your converted component customizations
// (If you made an index.js in customizations, you can just import that instead)
import { inputsCustomizations } from './theme/customizations/inputs.jsx';
import { surfacesCustomizations } from './theme/customizations/surfaces.jsx';
import { feedbackCustomizations } from './theme/customizations/feedback.jsx';
import { navigationCustomizations } from './theme/customizations/navigation.jsx';
import { dataDisplayCustomizations } from './theme/customizations/dataDisplay.jsx';

// 3. Build the actual theme
const dashboardTheme = createTheme({
  // THIS is what makes the awesome dark mode work automatically with your device!
  cssVariables: true, 
  colorSchemes: { light: true, dark: true },
  
  // Bring in the colors and fonts
  ...getDesignTokens('light'), 
  
  // Bring in the rounded corners, specific buttons, and inputs
  components: {
    ...inputsCustomizations,
    ...surfacesCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...dataDisplayCustomizations,
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap your app in the ThemeProvider so everything gets the styles */}
    <ThemeProvider theme={dashboardTheme}>
      {/* CssBaseline kicks in the background colors and global resets */}
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
  </StrictMode>
);