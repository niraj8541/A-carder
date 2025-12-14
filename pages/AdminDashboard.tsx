import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { User, Product, Order, GlobalSettings, UserRole, Coupon } from '../types';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, ClipboardList, Settings, Ticket, Check, X, Search, Trash2, Edit2, Plus, Ban, Unlock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'orders' | 'settings' | 'coupons'>('orders');

  // Check auth
  useEffect(() => {
    if (!isAdmin) navigate('/dashboard');
  }, [isAdmin, navigate]);

  if (!isAdmin || !user) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar / Menu */}
      <div className="lg:w-64 flex-shrink-0 space-y-2">
        <div className="bg-surface p-4 rounded-xl border border-slate-700 shadow-lg mb-4">
           <h2 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Admin Menu</h2>
           <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
             <ClipboardList size={18} /> Orders
           </button>
           <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
             <Users size={18} /> Users
           </button>
           <button onClick={() => setActiveTab('products')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${activeTab === 'products' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
             <ShoppingBag size={18} /> Products
           </button>
           <button onClick={() => setActiveTab('coupons')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${activeTab === 'coupons' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
             <Ticket size={18} /> Coupons
           </button>
           <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
             <Settings size={18} /> Settings
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-surface rounded-2xl border border-slate-700 p-6 min-h-[600px]">
        {activeTab === 'orders' && <OrdersPanel />}
        {activeTab === 'users' && <UsersPanel isSuperAdmin={isSuperAdmin} />}
        {activeTab === 'products' && <ProductsPanel />}
        {activeTab === 'coupons' && <CouponsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
};

// --- Sub Components ---

const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>(db.getOrders().reverse());

  const handleStatusChange = (orderId: string, status: Order['status'], content?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (status === 'approved' && !content) {
        content = prompt("Enter the Card Code / PDF Link / Secret Content for this user:") || "Unlocked";
    }

    const updatedOrder = { ...order, status, unlockedContent: content };
    db.updateOrder(updatedOrder);
    setOrders(db.getOrders().reverse());
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-700">
              <th className="p-3">ID</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                <td className="p-3 font-mono text-xs">{order.id}</td>
                <td className="p-3 text-sm">{order.userId}</td>
                <td className="p-3 font-medium">{order.productName}</td>
                <td className="p-3">₹{order.price}</td>
                <td className="p-3 text-xs text-slate-400">{new Date(order.purchaseDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.status === 'approved' ? 'text-green-400 bg-green-900/30' :
                    order.status === 'rejected' ? 'text-red-400 bg-red-900/30' :
                    'text-yellow-400 bg-yellow-900/30'
                  }`}>{order.status}</span>
                </td>
                <td className="p-3 flex gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(order.id, 'approved')} className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded" title="Approve & Send Code">
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleStatusChange(order.id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded" title="Reject & Refund">
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {order.status === 'approved' && <span className="text-xs text-slate-500">Completed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-slate-500 mt-8">No orders found.</p>}
      </div>
    </div>
  );
};

const UsersPanel = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => u.username.includes(search) || u.phone.includes(search));

  const refresh = () => setUsers(db.getUsers());

  const handleWallet = (userId: string) => {
    const amount = prompt("Enter amount to ADD (positive) or DEDUCT (negative):");
    if (amount) {
        db.updateUserWallet(userId, Number(amount), "Admin Adjustment", 'admin_adjustment');
        refresh();
    }
  };

  const toggleBan = (user: User) => {
    if (user.role === UserRole.SUPER_ADMIN) return;
    const updated = { ...user, isBanned: !user.isBanned };
    db.saveUser(updated);
    refresh();
  };

  const toggleAdmin = (user: User) => {
    if (!isSuperAdmin || user.role === UserRole.SUPER_ADMIN) return;
    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const updated = { ...user, role: newRole };
    db.saveUser(updated);
    refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input 
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none" 
            placeholder="Search users..." 
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm border-b border-slate-700">
              <th className="p-3">User</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Wallet</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3 text-sm text-slate-400">{u.phone}</td>
                <td className="p-3"><span className="bg-slate-800 px-2 py-1 rounded text-xs">{u.role}</span></td>
                <td className="p-3 font-mono text-green-400">₹{u.walletBalance}</td>
                <td className="p-3">
                  {u.isBanned ? <span className="text-red-500 text-xs font-bold">BANNED</span> : <span className="text-green-500 text-xs">Active</span>}
                </td>
                <td className="p-3 flex gap-2">
                   <button onClick={() => handleWallet(u.id)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white p-2 rounded text-xs">Wallet</button>
                   {isSuperAdmin && u.role !== UserRole.SUPER_ADMIN && (
                     <>
                        <button onClick={() => toggleAdmin(u)} className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white p-2 rounded text-xs">
                          {u.role === UserRole.ADMIN ? 'Demote' : 'Make Admin'}
                        </button>
                        <button onClick={() => toggleBan(u)} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white p-2 rounded text-xs">
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                     </>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProductsPanel = () => {
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [editing, setEditing] = useState<Product | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editing ? editing.id : Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      category: formData.get('category') as any,
      imageUrl: formData.get('imageUrl') as string || 'https://picsum.photos/400/300',
      stock: Number(formData.get('stock')),
      createdAt: new Date().toISOString()
    };
    
    // Simulate "File Upload" by just alerting
    const fileInput = (e.currentTarget.elements.namedItem('pdfFile') as HTMLInputElement);
    if (fileInput.files?.length) {
      alert("Simulated PDF Upload: File attached to product securely.");
      newProduct.pdfUrl = "simulated_secure_path_" + newProduct.id + ".pdf";
    }

    db.saveProduct(newProduct);
    setProducts(db.getProducts());
    setEditing(null);
    e.currentTarget.reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this product?")) {
      db.deleteProduct(id);
      setProducts(db.getProducts());
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>
      
      <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-xl mb-8 border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h3 className="md:col-span-2 text-lg font-bold text-primary">{editing ? 'Edit Product' : 'Add New Product'}</h3>
        <input name="name" defaultValue={editing?.name} placeholder="Product Name" required className="bg-background border border-slate-600 rounded p-2 text-white" />
        <input name="price" type="number" defaultValue={editing?.price} placeholder="Price (₹)" required className="bg-background border border-slate-600 rounded p-2 text-white" />
        <select name="category" defaultValue={editing?.category || 'Gift Card'} className="bg-background border border-slate-600 rounded p-2 text-white">
          <option value="Gift Card">Gift Card</option>
          <option value="Prepaid Card">Prepaid Card</option>
        </select>
        <input name="imageUrl" defaultValue={editing?.imageUrl} placeholder="Image URL (Optional)" className="bg-background border border-slate-600 rounded p-2 text-white" />
        <input name="stock" type="number" defaultValue={editing?.stock || 10} placeholder="Stock Qty" className="bg-background border border-slate-600 rounded p-2 text-white" />
        <textarea name="description" defaultValue={editing?.description} placeholder="Description" required className="md:col-span-2 bg-background border border-slate-600 rounded p-2 text-white h-20" />
        <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Upload Product PDF / Assets (Locked until purchase)</label>
            <input type="file" name="pdfFile" className="text-sm text-slate-400" />
        </div>
        <div className="md:col-span-2 flex gap-2">
           <button type="submit" className="bg-primary text-white px-6 py-2 rounded hover:bg-indigo-600">{editing ? 'Update' : 'Create'}</button>
           {editing && <button type="button" onClick={() => setEditing(null)} className="bg-slate-700 text-white px-6 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="grid gap-4">
        {products.map(p => (
          <div key={p.id} className="flex justify-between items-center p-4 bg-background border border-slate-700 rounded-lg">
            <div className="flex items-center gap-4">
              <img src={p.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-slate-400">₹{p.price} • {p.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="p-2 hover:bg-slate-700 rounded"><Edit2 size={16} className="text-blue-400"/></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-slate-700 rounded"><Trash2 size={16} className="text-red-400"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPanel = () => {
  const [settings, setSettings] = useState<GlobalSettings>(db.getSettings());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settings);
    alert("Payment settings updated!");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        <div>
           <label className="block mb-1 text-slate-400">UPI ID</label>
           <input 
             value={settings.upiId} 
             onChange={e => setSettings({...settings, upiId: e.target.value})}
             className="w-full bg-background border border-slate-600 rounded p-2 text-white" 
           />
        </div>
        <div>
           <label className="block mb-1 text-slate-400">UPI QR Image URL</label>
           <input 
             value={settings.upiQrUrl} 
             onChange={e => setSettings({...settings, upiQrUrl: e.target.value})}
             className="w-full bg-background border border-slate-600 rounded p-2 text-white" 
           />
           <img src={settings.upiQrUrl} alt="Preview" className="w-32 h-32 mt-2 object-contain bg-white rounded p-2" />
        </div>
        <div>
           <label className="block mb-1 text-slate-400">Payment Instructions / Note</label>
           <textarea 
             value={settings.paymentNote} 
             onChange={e => setSettings({...settings, paymentNote: e.target.value})}
             className="w-full bg-background border border-slate-600 rounded p-2 text-white h-24" 
           />
        </div>
        <button className="bg-primary text-white px-6 py-2 rounded hover:bg-indigo-600">Save Changes</button>
      </form>
    </div>
  );
};

const CouponsPanel = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(db.getCoupons());
  const [newCode, setNewCode] = useState('');
  const [amount, setAmount] = useState('');

  const addCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveCoupon({ code: newCode, discountAmount: Number(amount), isActive: true });
    setCoupons(db.getCoupons());
    setNewCode('');
    setAmount('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Coupon Codes</h2>
      <form onSubmit={addCoupon} className="flex gap-4 mb-8">
        <input 
          value={newCode} onChange={e => setNewCode(e.target.value)} 
          placeholder="Code (e.g. SAVE50)" className="bg-background border border-slate-600 rounded p-2 text-white flex-1" required 
        />
        <input 
          value={amount} onChange={e => setAmount(e.target.value)} type="number"
          placeholder="Discount ₹" className="bg-background border border-slate-600 rounded p-2 text-white w-32" required 
        />
        <button className="bg-primary text-white px-4 rounded">Add</button>
      </form>

      <div className="space-y-2">
        {coupons.map((c, i) => (
          <div key={i} className="flex justify-between items-center bg-background border border-slate-700 p-3 rounded">
            <span className="font-mono font-bold text-secondary">{c.code}</span>
            <span>₹{c.discountAmount} Off</span>
            <span className="text-green-500 text-xs">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
};