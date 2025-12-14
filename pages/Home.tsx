import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<'All' | 'Gift Card' | 'Prepaid Card'>('All');

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-slate-900 border border-slate-700 p-8 md:p-12 text-center md:text-left shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Digital Assets</h1>
          <p className="text-slate-300 text-lg mb-8">Secure, instant, and reliable gift cards and prepaid cards for all your digital needs.</p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <button onClick={() => setCategory('Gift Card')} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white px-6 py-3 rounded-full transition-all">
              Gift Cards
            </button>
            <button onClick={() => setCategory('Prepaid Card')} className="bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/20 px-6 py-3 rounded-full transition-all">
              Prepaid Cards
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {['All', 'Gift Card', 'Prepaid Card'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'bg-surface text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Link to={`/product/${product.id}`} key={product.id} className="group bg-surface rounded-xl overflow-hidden border border-slate-700 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10 flex flex-col h-full">
            <div className="relative aspect-video overflow-hidden">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-xs font-bold px-2 py-1 rounded text-white border border-white/10">
                {product.category}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xl font-bold text-white">₹{product.price}</span>
                <span className="flex items-center gap-2 text-sm font-medium text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg group-hover:bg-secondary group-hover:text-black transition-all">
                  Buy Now <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
          <p>No products found in this category.</p>
        </div>
      )}
    </div>
  );
};