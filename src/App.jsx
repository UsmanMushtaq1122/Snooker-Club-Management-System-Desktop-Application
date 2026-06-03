import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from './layouts/MainLayout';

export default function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    window.api.getSettings().then(settings => {
      if (settings.theme) {
        setTheme(settings.theme);
        document.body.setAttribute('data-theme', settings.theme);
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    window.api.saveSetting('theme', newTheme);
  }, [theme]);

  return <MainLayout theme={theme} onToggleTheme={toggleTheme} />;
}
