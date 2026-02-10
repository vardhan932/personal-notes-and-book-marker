import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure baseURL starts with http:// or https://
if (baseURL && !baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
    baseURL = `https://${baseURL}`;
}

console.log('API Base URL:', baseURL);

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
