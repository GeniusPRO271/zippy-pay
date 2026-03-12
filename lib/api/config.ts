import axios from 'axios'
import { getAuthHeaders } from './authHeader';

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function axiosWithAuth() {
  const headers = await getAuthHeaders()
  return axios.create({
    baseURL: API_URL,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  })
}
