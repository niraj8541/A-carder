export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface User {
  id: string;
  username: string;
  phone: string;
  passwordHash: string; // Simulated hash
  role: UserRole;
  walletBalance: number;
  isBanned: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Gift Card' | 'Prepaid Card';
  imageUrl: string;
  pdfUrl?: string; // Simulated file path
  stock: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  purchaseDate: string;
  unlockedContent?: string; // The "PDF" content becomes available here if approved
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'purchase' | 'refund' | 'admin_adjustment';
  amount: number;
  description: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

export interface GlobalSettings {
  upiId: string;
  upiQrUrl: string;
  paymentNote: string;
}

export interface Coupon {
  code: string;
  discountAmount: number;
  isActive: boolean;
}