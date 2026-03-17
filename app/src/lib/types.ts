export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  client_id: string;
  user_id: string;
  street: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  client_id: string;
  address_id: string;
  recurring_rule_id: string | null;
  scheduled_date: string;
  start_time: string | null;
  duration_minutes: number | null;
  service_type: string | null;
  price: number | null;
  status: "scheduled" | "in_progress" | "completed" | "invoiced" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: Client;
  addresses?: Address;
}

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Estimate {
  id: string;
  user_id: string;
  client_id: string;
  line_items: LineItem[];
  total: number | null;
  notes: string | null;
  contract_text: string | null;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  created_at: string;
  updated_at: string;
  clients?: Client;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  job_id: string | null;
  line_items: LineItem[];
  total: number | null;
  status: "unpaid" | "paid" | "void";
  due_date: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  clients?: Client;
  jobs?: Job;
}

export const SERVICE_TYPES = [
  "Regular Clean",
  "Deep Clean",
  "Move-Out Clean",
  "Move-In Clean",
  "Post-Construction",
  "One-Time Clean",
  "Office Clean",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];
