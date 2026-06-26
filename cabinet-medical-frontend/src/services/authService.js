import api from './api';

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const registerPatient = async (data) => {
    const response = await api.post('/auth/register/patient', data);
    return response.data;
};

export const registerDoctor = async (data) => {
    const response = await api.post('/auth/register/doctor', data);
    return response.data;
};