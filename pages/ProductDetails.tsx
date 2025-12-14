import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Product, Coupon } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Zap, Ticket, ArrowLeft, Loader2 } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const found = db.getProducts().find(p => p.id === id);
    if (found) setProduct(found);
    else navigate('/');
  }, [id, navigate]);

  if (!product) return null;

  const handleApplyCoupon = () => {
    const coupons = db.getCoupons();
    const validCoupon = coupons.find(c => c.code === couponCode && c.isActive);
    if (validCoupon) {
      setDiscount(validCoupon.discountAmount);
      setMessage(`Coupon applied! ₹${validCoupon.discountAmount} off.`);
    } else {
      setDiscount(0);
      setMessage('Invalid coupon code.');
    }
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const finalPrice = product.price - discount;

    if (user.walletBalance < finalPrice) {
      alert("Insufficient wallet balance. Please add money.");
      navigate('/dashboard');
      return;
    }

    if (window.confirm(`Confirm purchase for ₹${finalPrice}?`)) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        // Deduct money
        db.updateUserWallet(user.id, -finalPrice, `Purchase: ${product.name}`, 'purchase');
        // Create Order
        db.createOrder(user.id, product);
        
        refreshUser();
        setLoading(false);
        alert("Order placed successfully! Wait for admin approval to view your card details.");
        navigate('/dashboard');
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={16} /> Back to Store
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-surface rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-6">
          <div>
            <span className="inline-block bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded mb-2 border border-primary/20">
              {product.category.toUpperCase()}
            </span>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-slate-400 mt-2 text-lg">{product.description}</p>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center text-slate-300">
              <span>Price</span>
              <span>₹{product.price}</span>
            </div>
            {discount > 0 && (
               <div className="flex justify-between items-center text-green-400">
               <span>Discount</span>
               <span>- ₹{discount}</span>
             </div>
            )}
            <div className="h-px bg-slate-700 my-2"></div>
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Total</span>
              <span className="text-white">₹{product.price - discount}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Have a coupon?" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full bg-surface border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button onClick={handleApplyCoupon} className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg font-medium transition-colors">
              Apply
            </button>
          </div>
          {message && <p className={`text-sm ${discount > 0 ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}

          <button 
            onClick={handleBuy} 
            disabled={loading}
            className="w-full bg-secondary hover:bg-emerald-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
            {loading ? 'Processing...' : 'Pay & Buy Now'}
          </button>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <ShieldCheck size={16} /> Secure Payment via Wallet
          </div>
        </div>
      </div>
    </div>
  );
};