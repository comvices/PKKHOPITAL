export interface Department {
  id: number;
  name: string;
  url: string;
  category: 'medical' | 'support' | 'admin' | 'other';
  status: 'active' | 'maintenance' | 'offline';
  updated_at?: string;
}
