import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Star, ChevronRight,
  TrendingUp, Award, LayoutGrid, Store, Package,
  ArrowRight, Heart, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    <div className="flex text-amber-400">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          fill={i < Math.floor(rating) ? "currentColor" : "none"}
          className={i < Math.floor(rating) ? "text-amber-400" : "text-slate-600"}
        />
      ))}
    </div>
    {count !== undefined && (
      <span className="text-xs text-slate-500 ml-1">({count})</span>
    )}
  </div>
);

const ProductCard = ({ product, onAddToCart }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
    className="glass group relative p-4 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all"
  >
    <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-4 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
        {product.category_name?.includes('อาหาร') ? '🍲' : 
         product.category_name?.includes('เครื่องแต่งกาย') ? '👕' : 
         product.category_name?.includes('ประดับ') ? '💎' : '🎁'}
      </div>
      <button className="absolute top-3 right-3 p-2 rounded-full glass opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart size={16} className="text-slate-300 hover:text-red-400" />
      </button>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-white leading-tight line-clamp-2">{product.name}</h4>
        <span className="text-blue-400 font-black">฿{product.price}</span>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Store size={12} />
        <span className="truncate">{product.shop_name}</span>
      </div>

      <div className="flex justify-between items-center pt-2">
        <StarRating rating={product.avg_rating} count={product.review_count} />
        <button 
          onClick={() => onAddToCart(product)}
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white transition-colors"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const ShoppingScreen = ({ user, token, onAddToCart }) => {
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory || selectedShop) {
      fetchFilteredProducts();
    } else {
      fetchAllProducts();
    }
  }, [selectedCategory, selectedShop]);

  const fetchInitialData = async () => {
    try {
      const [catsRes, popularRes, recRes, shopsRes] = await Promise.all([
        fetch('/api/categories/'),
        fetch('/api/products/popular/'),
        fetch('/api/products/recommended/'),
        fetch('/api/shops/')
      ]);
      
      setCategories(await catsRes.json());
      setPopularProducts(await popularRes.json());
      setRecommendedProducts(await recRes.json());
      setShops(await shopsRes.json());
      setLoading(false);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const fetchAllProducts = async () => {
    const res = await fetch('/api/products/');
    setProducts(await res.json());
  };

  const fetchFilteredProducts = async () => {
    let url = '/api/products/?';
    if (selectedCategory) url += `category=${selectedCategory.id}&`;
    if (selectedShop) url += `shop=${selectedShop.id}&`;
    const res = await fetch(url);
    setProducts(await res.json());
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-12 md:p-20">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6"
          >
            ภูมิปัญญาไทยสู่สากล
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight"
          >
            ค้นหาผลิตภัณฑ์ <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              เหนือระดับจากทั่วไทย
            </span>
          </motion.h1>
          
          <div className="relative max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              placeholder="ค้นหาสินค้า พิกัด หรือชื่อร้าน..."
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 text-white outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories Scroller */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutGrid className="text-blue-400" />
            สำรวจตามหมวดหมู่
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          <button 
            onClick={() => { setSelectedCategory(null); setSelectedShop(null); }}
            className={cn(
              "px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border",
              !selectedCategory ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" : "glass border-white/10 text-slate-400 hover:text-white"
            )}
          >
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => { setSelectedCategory(cat); setSelectedShop(null); }}
              className={cn(
                "px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all border",
                selectedCategory?.id === cat.id ? "bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20" : "glass border-white/10 text-slate-400 hover:text-white"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Recommendations Slider */}
      {!selectedCategory && !selectedShop && (
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Award className="text-amber-400" />
              แนะนำสำหรับคุณ
            </h2>
            <button className="text-sm font-bold text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
              ดูทั้งหมด <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {recommendedProducts.slice(0, 5).map(prod => (
              <ProductCard key={prod.id} product={prod} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Trending / High Rating */}
      {!selectedCategory && !selectedShop && (
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-emerald-400" />
              ยอดนิยมระดับ 5 ดาว
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {popularProducts.slice(0, 5).map(prod => (
              <ProductCard key={prod.id} product={prod} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* Main Feed */}
      <section className="pt-8">
        <div className="flex items-center justify-between mb-10 px-2">
          <div>
            <h2 className="text-3xl font-black text-white">
              {selectedCategory ? selectedCategory.name : selectedShop ? selectedShop.name : 'สินค้าทั้งหมด'}
            </h2>
            <p className="text-slate-500 mt-1 font-medium">พบผลิตภัณฑ์คุณภาพ {products.length} รายการ</p>
          </div>
          <button className="glass px-6 py-3 rounded-xl border border-white/10 flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <Filter size={18} />
            <span className="text-sm font-bold">ตัวกรอง</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode='popLayout'>
            {products.slice(0, 12).map(prod => (
              <ProductCard key={prod.id} product={prod} onAddToCart={onAddToCart} />
            ))}
          </AnimatePresence>
        </div>

        {products.length === 0 && (
          <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-white/5">
            <Package size={48} className="mx-auto text-slate-800 mb-4" />
            <h3 className="text-xl font-bold text-slate-600">ไม่พบข้อมูลสินค้า</h3>
            <p className="text-slate-700 mt-2">กรุณาลองเปลี่ยนหมวดหมู่หรือตัวกรองอื่น</p>
          </div>
        )}
      </section>

      {/* Featured Shops */}
      {!selectedCategory && !selectedShop && (
        <section className="bg-slate-950/50 rounded-[40px] p-12 border border-white/5">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Store className="text-purple-400" />
              ร้านค้าแนะนำ
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shops.slice(0, 3).map(shop => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={shop.id} 
                onClick={() => setSelectedShop(shop)}
                className="glass p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-purple-500/20 group-hover:rotate-6 transition-transform">
                  🏠
                </div>
                <h3 className="text-xl font-black text-white mb-2">{shop.name}</h3>
                <span className="inline-block px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-purple-400 mb-4">
                  {shop.category_name}
                </span>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6">{shop.description}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  เข้าชมร้าน <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ShoppingScreen;
