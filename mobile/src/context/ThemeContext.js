import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../theme/tokens';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync('user-theme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            } else {
                setIsDark(systemColorScheme === 'dark');
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newValue = !isDark;
        setIsDark(newValue);
        await SecureStore.setItemAsync('user-theme', newValue ? 'dark' : 'light');
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
