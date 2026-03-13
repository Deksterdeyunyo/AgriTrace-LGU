export type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'encoder';
  email: string;
};

export type Program = {
  id: string;
  name: string;
  funding_year: number;
  is_active: boolean;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  item_name: string;
  batch_number: string;
  supplier: string;
  storage_location: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  reorder_level: number;
  supporting_doc_url?: string;
  program_id: string;
  is_active: boolean;
  created_at: string;
};

export type Recipient = {
  id: string;
  rsbsa_number: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  farmer_type: string[]; // Rice, Corn, etc.
  latitude: number;
  longitude: number;
  civil_status: string;
  membership: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export type Distribution = {
  id: string;
  recipient_id: string;
  item_id: string;
  quantity: number;
  mode: 'Individual Pick-up' | 'Barangay Drop-off' | 'Mass Distribution';
  signature_url?: string;
  representative_name?: string;
  representative_relationship?: string;
  auth_letter_url?: string;
  latitude: number;
  longitude: number;
  remarks?: string;
  encoder_id: string;
  created_at: string;
};
