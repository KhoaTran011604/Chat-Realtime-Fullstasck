import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error logging
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (data: { name: string; email: string; password: string; avatar?: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
};

// User endpoints
export const userAPI = {
    searchUsers: (search: string) =>
        api.get(`/users/search?search=${search}`),
    getProfile: () =>
        api.get('/users/profile'),
};

// Chat endpoints
export const chatAPI = {
    accessChat: (userId: string) =>
        api.post('/chats', { userId }),
    fetchChats: () =>
        api.get('/chats'),
    createGroupChat: (name: string, users: string[]) =>
        api.post('/chats/group', { name, users: JSON.stringify(users) }),
    renameGroup: (chatId: string, chatName: string) =>
        api.put('/chats/group/rename', { chatId, chatName }),
    addToGroup: (chatId: string, userId: string) =>
        api.put('/chats/group/add', { chatId, userId }),
    removeFromGroup: (chatId: string, userId: string) =>
        api.put('/chats/group/remove', { chatId, userId }),
};

// Message endpoints
export const messageAPI = {
    sendMessage: (content: string, chatId: string, image?: File) => {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('chatId', chatId);
        if (image) {
            formData.append('image', image);
        }
        return api.post('/messages', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getMessages: (chatId: string) => api.get(`/messages/${chatId}`),
};

export default api;
