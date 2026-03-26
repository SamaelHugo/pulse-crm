// Serialized types for passing from server → client components.
// Dates become ISO strings because they cross the RSC boundary.

export interface ClientData {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { deals: number };
  totalDeals?: number;
  revenue?: number;
  lastContact?: string;
}

export interface DealData {
  id: string;
  title: string;
  value: number;
  stage: string;
  clientId: string;
  createdAt: string;
  closedAt: string | null;
  client?: {
    id: string;
    name: string;
    company: string;
    email: string;
    avatar?: string;
  };
}

export interface NoteData {
  id: string;
  text: string;
  author: string;
  clientId: string;
  createdAt: string;
}

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
  deals: number;
  newClients: number;
}
