// context/ColorModeContext.js
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { getDesignTokens } from "../theme";
import { ColorModeContext } from "./useColorMode";

export const ColorModeProvider = ({ children }) => {
  // Initialize mode from localStorage or default to "light"
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || "light"; // Default to light mode
  });

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Force light mode for modals and forms
  const forceLightMode = () => {
    setMode("light");
  };

  const theme = useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode, forceLightMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
