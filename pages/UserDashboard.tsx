import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { Order, Transaction, GlobalSettings } from '../types';
import { Wallet, Package, Clock, CheckCircle, XCircle, FileText, Upload, ImageOff, Maximize2, Copy, ScanLine } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(db.getSettings());
  const [activeTab, setActiveTab] = useState<'orders' | 'wallet'>('orders');
  const [qrError, setQrError] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  
  // Wallet Add Money State
  const [amount, setAmount] = useState('');
  const [txnId, setTxnId] = useState('');

  // Setup listeners for settings updates
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettings(db.getSettings());
      setQrError(false); // Reset error state on new settings
    };
    
    // Listen for custom event from db.saveSettings (same window)
    window.addEventListener('settings-updated', handleSettingsUpdate);
    // Listen for storage event (cross-tab/window)
    window.addEventListener('storage', handleSettingsUpdate);

    // Initial fetch
    handleSettingsUpdate();

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Also force refresh when clicking wallet tab
  useEffect(() => {
    if (activeTab === 'wallet') {
      setSettings(db.getSettings());
      setQrError(false);
    }
  }, [activeTab]);

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
    
    // Create Pending Request
    db.createDepositRequest(user.id, Number(amount), txnId);
    
    alert("Request Submitted! Admin will verify your transaction and update your wallet.");
    setAmount('');
    setTxnId('');
    
    // Refresh local lists
    const allTxns = db.getTransactions();
    setTransactions(allTxns.filter(t => t.userId === user.id).reverse());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("UPI ID Copied to clipboard!");
  };

  if (!user) return null;

  return (
    <div className="space-y-6 relative">
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
            
            {/* Clickable QR Card */}
            <div 
              onClick={() => {
                if (settings.upiQrUrl && !qrError) setQrModalOpen(true);
              }}
              className="group cursor-pointer flex flex-col items-center justify-center mb-6 bg-white p-4 rounded-xl w-max mx-auto overflow-hidden relative shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
               {/* Header Badge */}
               <div className="absolute top-0 left-0 w-full bg-black/5 h-6 flex items-center justify-center">
                 <ScanLine size={12} className="text-black/30" />
               </div>

               {/* Overlay with instructions on hover */}
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10">
                 <Maximize2 className="text-black drop-shadow-md mb-1" size={32} />
                 <span className="text-xs font-bold text-black bg-white/80 px-2 py-0.5 rounded shadow-sm">View Fullscreen</span>
               </div>

               {/* QR Display */}
               <div className="mt-2">
               {settings.upiQrUrl && !qrError ? (
                 <img 
                   src={settings.upiQrUrl} 
                   alt="UPI QR" 
                   className="w-48 h-48 object-contain mix-blend-multiply"
                   onError={() => setQrError(true)} 
                 />
               ) : (
                 <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-100 text-slate-800 text-sm p-4 text-center">
                   <ImageOff size={24} className="mb-2 text-slate-400"/>
                   <span className="font-medium">QR not available</span>
                   <span className="text-xs text-slate-500 mt-1">Use UPI ID below</span>
                 </div>
               )}
               </div>
               
               <p className="text-black font-mono font-bold mt-2 text-sm px-3 py-1 bg-gray-100 rounded border border-gray-200 flex items-center gap-2">
                 {settings.upiId} 
               </p>
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
                Request Deposit
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
                    {txn.type === 'deposit' ? <Upload size={16} className={txn.status === 'success' ? "text-green-500" : "text-yellow-500"}/> : <Package size={16} className="text-blue-500"/>}
                    <div>
                      <p className="text-sm font-medium text-slate-200">{txn.description}</p>
                      <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString()} • <span className={`uppercase ${txn.status === 'success' ? 'text-green-500' : txn.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>{txn.status}</span></p>
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

      {/* QR Code Modal (Lightbox) */}
      {qrModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setQrModalOpen(false)} 
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-500 transition-colors"
            >
              <XCircle size={24} />
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ScanLine className="text-primary" /> Scan to Pay
            </h3>
            
            <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-inner mb-6">
               <img src={settings.upiQrUrl} alt="Large QR" className="w-64 h-64 object-contain mix-blend-multiply" />
            </div>

            <div className="w-full space-y-3">
              <p className="text-center text-slate-500 text-sm font-medium">Merchant UPI ID</p>
              <button 
                onClick={() => copyToClipboard(settings.upiId)}
                className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 p-4 rounded-xl border border-slate-200 transition-all group"
              >
                 <span className="font-mono font-bold text-slate-900 truncate">{settings.upiId}</span>
                 <div className="flex items-center gap-1 text-xs font-bold text-primary uppercase bg-white px-2 py-1 rounded border border-slate-200">
                    <Copy size={12} /> Copy
                 </div>
              </button>
              <p className="text-center text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                {settings.paymentNote}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};