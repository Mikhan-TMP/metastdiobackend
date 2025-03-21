import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.141:3001',
});

export default API;
