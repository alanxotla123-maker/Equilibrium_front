import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const email = localStorage.getItem('equilibrium_user_email');
    if (email) {
      config.headers['x-user-email'] = email;
    }
    return config;
  });
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  isCompleted: boolean;
  category?: Category;
}

export interface Saving {
  id: string;
  title: string;
  goalAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: Category;
}

export interface Card {
  id: string;
  name: string;
  creditLimit: number;
  closingDay: number;
  dueDate: number;
  initialSpent: number;
}

export interface Transaction {
  id: string;
  type: 'gasto' | 'ingreso';
  amount: number;
  date: string;
  description?: string;
  category?: Category;
  card?: Card;
  cardId?: string;
}
