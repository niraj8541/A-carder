import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { Order, Transaction } from '../types';
import { Wallet, Package, Clock, CheckCircle, XCircle, FileText, Upload } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState(db.getSettings());
  const [activeTab, setActiveTab] = useState<'orders' | 'wallet'>('orders');
  
  // Wallet Add Money State
  const [amount, setAmount] = useState('');
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    if (user) {
      const allOrders = db.getOrders();
      setOrders(allOrders.filter(o => o.userId === user.id).reverse());

      const allTxns = db.getTransactions();
      setTransactions(allTxns.filter(t => t.userId === user.id).reverse());
    }
  }, [user]);

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Simulate Admin Processing: In a real app, this would be a request. 
    // For this demo, we'll simulate a "Manual Request" that instantly adds funds 
    // BUT typically an admin would verify the transaction ID.
    // I will auto-approve for demo convenience or leave it as a request?
    // Let's make it a request that the user sees as "Pending" or just auto-add for UX smoothness in demo.
    // Let's auto-add to simulate "Prepaid/Gateway" success for the demo flow.
    
    db.updateUserWallet(user.id, Number(amount), `UPI Load: ${txnId}`, 'deposit');
    refreshUser();
    alert("Funds added successfully (simulated)!");
    setAmount('');
    setTxnId('');
    
    // Refresh local lists
    const allTxns = db.getTransactions();
    setTransactions(allTxns.filter(t => t.userId === user.id).reverse());
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-slate-400 font-mono">{user.phone}</p>
          </div>
        </div>
        <div className="bg-black/30 p-4 rounded-xl border border-slate-700 min-w-[200px] text-center">
          <p className="text-slate-400 text-sm mb-1">Wallet Balance</p>
          <p className="text-3xl font-bold text-secondary">₹{user.walletBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700 pb-1">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'orders' ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
        >
          My Orders
          {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 px-4 text-sm font-medium transition-all relative ${activeTab === 'wallet' ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
        >
          Add Money / Wallet
          {activeTab === 'wallet' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No orders yet.</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-surface rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{order.productName}</h3>
                    <p className="text-sm text-slate-400">ID: {order.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(order.purchaseDate).toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    order.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    order.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                {order.status === 'approved' ? (
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mt-4">
                     <p className="text-sm text-slate-400 mb-2 flex items-center gap-2"><FileText size={14}/> Your Asset:</p>
                     <div className="font-mono text-green-300 break-all bg-black/40 p-3 rounded border border-slate-700">
                       {order.unlockedContent || "Content Ready - Contact Admin if empty"}
                     </div>
                     <button className="mt-2 text-xs text-primary hover:underline">Download PDF</button>
                   </div>
                ) : (
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 mt-4 flex items-center gap-3 text-sm text-slate-400">
                    <Clock size={16} className="text-yellow-500" />
                    Awaiting admin approval. Details will appear here once approved.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Money Form */}
          <div className="bg-surface p-6 rounded-2xl border border-slate-700">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Wallet className="text-primary"/> Add Funds</h3>
            
            <div className="flex flex-col items-center justify-center mb-6 bg-white p-4 rounded-xl w-max mx-auto">
               <img src={settings.upiQrUrl} alt="UPI QR" className="w-48 h-48 object-contain" />
               <p className="text-black font-mono font-bold mt-2 text-sm">{settings.upiId}</p>
            </div>
            
            <p className="text-center text-slate-400 text-sm mb-6 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              {settings.paymentNote}
            </p>

            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-background border border-slate-600 rounded-lg p-3 mt-1 text-white focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Transaction ID / UTR</label>
                <input 
                  type="text" 
                  required 
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                  className="w-full bg-background border border-slate-600 rounded-lg p-3 mt-1 text-white focus:ring-2 focus:ring-primary outline-none" 
                  placeholder="Enter UPI Ref ID"
                />
              </div>
              <button type="submit" className="w-full bg-secondary hover:bg-emerald-600 text-black font-bold py-3 rounded-lg transition-all">
                Verify & Add Balance
              </button>
            </form>
          </div>

          {/* Transaction History */}
          <div className="bg-surface p-6 rounded-2xl border border-slate-700 h-fit">
            <h3 className="text-xl font-bold mb-4">History</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {transactions.map(txn => (
                <div key={txn.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-slate-800">
                  <div className="flex items-center gap-3">
                    {txn.type === 'deposit' ? <Upload size={16} className="text-green-500"/> : <Package size={16} className="text-blue-500"/>}
                    <div>
                      <p className="text-sm font-medium text-slate-200">{txn.description}</p>
                      <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold ${txn.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-slate-500 text-center text-sm">No transactions found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};