import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
    android: 'https://startup-connect-api.onrender.com', // Change this to your exact Render.com/Railway URL
    ios: 'https://startup-connect-api.onrender.com',     // Change this to your exact Render.com/Railway URL
    default: 'https://startup-connect-api.onrender.com', // Change this to your exact Render.com/Railway URL
});

export const API_URL = `${API_BASE_URL}/api`;
