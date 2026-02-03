import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, User, LogOut, Package, Grid, Compass } from 'lucide-react'
import MCPExplorer from './MCPExplorer'
import AuthScreen from './AuthScreen'
import ShoppingScreen from './ShoppingScreen'

const OTOPSApp = () => {
  const [cart, setCart] = useState([])
  const [view, setView] = useState('marketplace') // 'marketplace', 'mcp', or 'auth'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('otop_token')
    const savedUser = localStorage.getItem('otop_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setView('marketplace')
  }

  const handleLogout = () => {
    localStorage.removeItem('otop_token')
    localStorage.removeItem('otop_user')
    setUser(null)
    setToken(null)
    // No need to redirect if public browsing is allowed
  }

  const addToCart = (product) => {
    setCart(prev => [...prev, product])
    // Tiny toast or feedback could be added here
  }

  return (
    <div className="min-h-screen bg-[#070910] text-slate-200 selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-[100] border-b border-white/5 bg-[#070910]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('marketplace')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              O
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-white leading-none">OTOPS</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Marketplace</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-8">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setView('marketplace')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'marketplace' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid size={16} />
                <span className="hidden md:inline">ร้านค้า</span>
              </button>
              <button
                onClick={() => setView('mcp')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'mcp' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Compass size={16} />
                <span className="hidden md:inline">สำรวจ MCP</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer group" onClick={() => setShowCart(!showCart)}>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 group-hover:text-white group-hover:bg-white/10 transition-all">
                  <ShoppingCart size={20} />
                </div>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-black text-white ring-2 ring-[#070910]">
                    {cart.length}
                  </span>
                )}
              </div>

              {user ? (
                <div className="flex items-center gap-3 pl-2">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-bold text-white leading-none mb-0.5">{user.username}</p>
                    <p className="text-[10px] text-slate-500">Member</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setView('auth')}
                  className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-32 pb-20">
        <AnimatePresence mode="wait">
          {view === 'mcp' ? (
            <motion.div 
              key="mcp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MCPExplorer onBack={() => setView('marketplace')} />
            </motion.div>
          ) : view === 'auth' ? (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          ) : (
            <motion.div 
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ShoppingScreen 
                user={user} 
                token={token} 
                onAddToCart={addToCart} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Modal/Flyout (Minimal Implementation) */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[201] w-full max-w-md h-full bg-[#0d111d] border-l border-white/10 shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white">ตะกร้าของคุณ</h3>
                <button onClick={() => setShowCart(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
              </div>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🛒</div>
                    <p className="text-slate-500 font-bold">ยังไม่มีสินค้าในตะกร้า</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 glass p-4 rounded-2xl border border-white/5">
                      <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-2xl">📦</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.shop_name}</p>
                        <p className="text-blue-400 font-black mt-2">฿{item.price}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="absolute bottom-10 left-8 right-8 space-y-4">
                  <div className="flex justify-between items-end border-t border-white/10 pt-6">
                    <span className="text-slate-500 font-bold">ราคารวมทั่งหมด</span>
                    <span className="text-2xl font-black text-white">฿{cart.reduce((sum, item) => sum + Number(item.price), 0)}</span>
                  </div>
                  <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    ยืนยันการสั่งซื้อ
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 bg-black/20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-black text-white mb-6">OTOPS Thailand</h3>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
              แพลตฟอร์มที่รวบรวมผลิตภัณฑ์คุณภาพจากภูมิปัญญาท้องถิ่นไทย ส่งตรงถึงมือคุณด้วยนวัตกรรมและเทคโนโลยีที่ทันสมัย
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">เกี่ยวกับเรา</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">เรื่องราวของ OTOPS</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">ผู้สนับสนุนโครงการ</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">ติดต่อสอบถาม</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">สนับสนุน</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li className="hover:text-blue-400 cursor-pointer transition-colors">คู่มือใช้งาน</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">นโยบายความเป็นส่วนตัว</li>
              <li className="hover:text-blue-400 cursor-pointer transition-colors">ข้อกำหนดและเงื่อนไข</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-12 mt-12 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">
            © 2026 ศูนย์พัฒนาเทคโนโลยีสารสนเทศ - สร้างขึ้นเพื่อส่งเสริมเศรษฐกิจชุมชน
          </p>
        </div>
      </footer>
    </div>
  )
}

export default OTOPSApp
