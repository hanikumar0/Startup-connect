import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Authentication error' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
  };

  const sendOTP = async (email: string) => {
    try {
      const res = await api.post('/auth/send-otp', { email });
      return { success: res.data.success, message: res.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to send verification code' };
    }
  };

  const registerVerify = async (data: any) => {
    try {
      const res = await api.post('/auth/register-verify', data);
      if (res.data.success) {
        const { token, user: userData } = res.data;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, sendOTP, registerVerify }}>
      {children}
    </AuthContext.Provider>
  );
};
