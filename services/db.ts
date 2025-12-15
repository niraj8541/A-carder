import { User, Product, Order, Transaction, GlobalSettings, UserRole, Coupon } from '../types';

const KEYS = {
  USERS: 'acarder_users',
  PRODUCTS: 'acarder_products',
  ORDERS: 'acarder_orders',
  TRANSACTIONS: 'acarder_transactions',
  SETTINGS: 'acarder_settings',
  COUPONS: 'acarder_coupons'
};

// Initial Setup
const DEFAULT_ADMIN = {
  username: 'niraj2546',
  password: '0852963741@Ap', // In a real app, this should be environmental
  phone: '7070294070'
};

const DEFAULT_SETTINGS: GlobalSettings = {
  upiId: 'merchant@upi',
  upiQrUrl: '', 
  paymentNote: 'Scan and pay. Mention your username in remarks.'
};

// Helper for safe storage
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error("LocalStorage Limit Exceeded", e);
    throw new Error("Storage Limit Exceeded! Cannot save data. Please delete old products or images.");
  }
};

export const db = {
  init: () => {
    // 1. Ensure Super Admin exists or is updated with latest credentials
    let users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const adminIndex = users.findIndex(u => u.username === DEFAULT_ADMIN.username);

    const superAdmin: User = {
      id: adminIndex !== -1 ? users[adminIndex].id : 'admin-1',
      username: DEFAULT_ADMIN.username,
      phone: DEFAULT_ADMIN.phone,
      passwordHash: btoa(DEFAULT_ADMIN.password), // Simple mock hash
      role: UserRole.SUPER_ADMIN,
      walletBalance: adminIndex !== -1 ? users[adminIndex].walletBalance : 10000,
      isBanned: false,
      createdAt: adminIndex !== -1 ? users[adminIndex].createdAt : new Date().toISOString()
    };

    if (adminIndex !== -1) {
      users[adminIndex] = superAdmin; // Update existing to ensure phone/pass match
      console.log('[DB] Super Admin credentials updated.');
    } else {
      users.push(superAdmin); // Create new
      console.log('[DB] Super Admin initialized.');
    }
    safeSetItem(KEYS.USERS, JSON.stringify(users));

    // 2. Default Settings
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      // Use a placeholder if initializing from scratch
      const initialSettings = {
        ...DEFAULT_SETTINGS,
        // Use a generic placeholder
        upiQrUrl: ''
      };
      safeSetItem(KEYS.SETTINGS, JSON.stringify(initialSettings));
    }

    // 3. Default Products
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      // Seed some dummy products with STATIC images to prevent "different image" issue
      const products: Product[] = [
        {
          id: 'p1',
          name: 'Amazon ₹500 Gift Card',
          description: 'Valid for 1 year. Instant redemption.',
          price: 500,
          category: 'Gift Card',
          imageUrl: 'https://placehold.co/600x400/252f3f/ffffff?text=Amazon+Card', // Static placeholder
          stock: 10,
          createdAt: new Date().toISOString()
        },
        {
          id: 'p2',
          name: 'Visa Prepaid ₹1000',
          description: 'Use anywhere Visa is accepted online.',
          price: 1050, // Slight markup
          category: 'Prepaid Card',
          imageUrl: 'https://placehold.co/600x400/10b981/ffffff?text=Visa+Prepaid', // Static placeholder
          stock: 5,
          createdAt: new Date().toISOString()
        }
      ];
      safeSetItem(KEYS.PRODUCTS, JSON.stringify(products));
    }

    // 4. Coupons
    if (!localStorage.getItem(KEYS.COUPONS)) {
      safeSetItem(KEYS.COUPONS, JSON.stringify([]));
    }
  },

  // User Methods
  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  
  saveUser: (user: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    safeSetItem(KEYS.USERS, JSON.stringify(users));
  },

  findUserByUsername: (username: string): User | undefined => {
    return db.getUsers().find(u => u.username === username);
  },

  updateUserWallet: (userId: string, amount: number, description: string, type: Transaction['type']) => {
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;

    users[userIndex].walletBalance += amount;
    safeSetItem(KEYS.USERS, JSON.stringify(users));

    // Record Transaction
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    transactions.push({
      id: Date.now().toString(),
      userId,
      type,
      amount,
      description,
      date: new Date().toISOString(),
      status: 'success'
    });
    safeSetItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // NEW: Deposit Request Flow
  createDepositRequest: (userId: string, amount: number, utr: string) => {
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
    const newTxn: Transaction = {
      id: 'txn-' + Date.now(),
      userId,
      type: 'deposit',
      amount,
      description: `UPI Load: ${utr}`,
      utr,
      date: new Date().toISOString(),
      status: 'pending'
    };
    transactions.push(newTxn);
    safeSetItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTxn;
  },

  approveDeposit: (txnId: string) => {
    const transactions: Transaction[] = db.getTransactions();
    const txnIndex = transactions.findIndex(t => t.id === txnId);
    if (txnIndex === -1) return false;
    
    const txn = transactions[txnIndex];
    if (txn.status !== 'pending') return false;

    // 1. Update Transaction Status
    txn.status = 'success';
    transactions[txnIndex] = txn;
    safeSetItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // 2. Credit Wallet
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === txn.userId);
    if (userIndex !== -1) {
      users[userIndex].walletBalance += txn.amount;
      safeSetItem(KEYS.USERS, JSON.stringify(users));
    }
    return true;
  },

  rejectDeposit: (txnId: string) => {
    const transactions: Transaction[] = db.getTransactions();
    const txnIndex = transactions.findIndex(t => t.id === txnId);
    if (txnIndex === -1) return false;
    
    transactions[txnIndex].status = 'failed';
    safeSetItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  },

  // Product Methods
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  
  saveProduct: (product: Product) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    safeSetItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = db.getProducts().filter(p => p.id !== id);
    safeSetItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Order Methods
  createOrder: (userId: string, product: Product) => {
    const orders: Order[] = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      userId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      status: 'pending', // Requires admin approval to see 'PDF'
      purchaseDate: new Date().toISOString()
    };
    orders.push(newOrder);
    safeSetItem(KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  getOrders: (): Order[] => JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]'),
  
  updateOrder: (order: Order) => {
    const orders = db.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
      safeSetItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // Settings
  getSettings: (): GlobalSettings => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
      // Merge with defaults to ensure keys like upiId always exist
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (e) {
      // If parsing fails, return defaults but DO NOT overwrite potentially valid (but malformed) data immediately
      return DEFAULT_SETTINGS;
    }
  },
  
  saveSettings: (settings: GlobalSettings) => {
    safeSetItem(KEYS.SETTINGS, JSON.stringify(settings));
    // Dispatch event so other components know to update immediately
    window.dispatchEvent(new Event('settings-updated'));
  },

  // Coupons
  getCoupons: (): Coupon[] => JSON.parse(localStorage.getItem(KEYS.COUPONS) || '[]'),
  
  saveCoupon: (coupon: Coupon) => {
    const coupons = db.getCoupons();
    coupons.push(coupon);
    safeSetItem(KEYS.COUPONS, JSON.stringify(coupons));
  },

  getTransactions: (): Transaction[] => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
};

// Initialize on load
try {
    db.init();
} catch(e) {
    console.error("DB Initialization failed", e);
}