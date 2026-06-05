// This is just example how to use apiClient. 
// You can delete this file and create your own components in the src/components directory.
import { apiClient } from '../api/client';

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

// Type must match the backend response structure
const data = await apiClient<MenuItem[]>('/menu-items');