import axios from 'axios';

// Using local IP to allow connection from physical devices on the same network
const client = axios.create({
    baseURL: 'http://192.168.139.13:3000/api',
});

export default client;
