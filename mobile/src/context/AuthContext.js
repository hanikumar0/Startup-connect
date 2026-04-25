import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { API_URL, API_BASE_URL } from '../utils/constants';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();

        // Setup Axios Interceptor to catch expired tokens
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response && error.response.status === 401) {
                    console.log('Token expired, logging out automatically');
                    await logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    async function loadStorageData() {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const userStr = await SecureStore.getItemAsync('user_data');

            if (token && userStr) {
                const _user = JSON.parse(userStr);
                setUser(_user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            // Always preserve local bypass for testing tunneled endpoints
            axios.defaults.headers.common['bypass-tunnel-reminder'] = 'true';
        } catch (error) {
            console.error('Failed to load auth data', error);
        } finally {
            setLoading(false);
        }
    }

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;

            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await SecureStore.setItemAsync('user_token', token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(user));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            const { token, user } = response.data;

            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await SecureStore.setItemAsync('user_token', token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(user));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const redirectUri = AuthSession.makeRedirectUri();
            const authUrl = `${API_BASE_URL}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            if (result.type === 'success' && result.url) {
                // The URL will look like: scheme://login?token=xyz&user={...}
                const url = new URL(result.url.replace('#', '?'));
                const token = url.searchParams.get('token');
                const userStr = url.searchParams.get('user');

                if (token && userStr) {
                    const user = JSON.parse(userStr);
                    setUser(user);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    await SecureStore.setItemAsync('user_token', token);
                    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
                    return { success: true };
                }
            }
            return { success: false, message: 'Google Auth stopped or failed' };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, message: 'Google login failed' };
        }
    };

    const logout = async () => {
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_data');
    };

    const refreshUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`);
            if (response.data.user) {
                setUser(response.data.user);
                await SecureStore.setItemAsync('user_data', JSON.stringify(response.data.user));
            }
        } catch (error) {
            console.error('Failed to refresh user data', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
