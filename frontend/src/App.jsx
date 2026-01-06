import React, { useState, useEffect } from 'react'
import MCPExplorer from './MCPExplorer'
import AuthScreen from './AuthScreen'

const OTOPSApp = () => {
  const [cart, setCart] = useState([])
  const [view, setView] = useState('marketplace') // 'marketplace' or 'mcp'
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

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
  }

  const handleLogout = () => {
    localStorage.removeItem('otop_token')
    localStorage.removeItem('otop_user')
    setUser(null)
    setToken(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center">
        <div
          className="flex flex-col cursor-pointer"
          onClick={() => setView('marketplace')}
        >
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            ตลาด OTOPS
          </h1>
          <span className="text-xs text-slate-400 font-medium tracking-wide">หนึ่งตำบลหนึ่งผลิตภัณฑ์</span>
        </div>
        <div className="flex gap-6 items-center">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setView('marketplace'); }}
            className={`transition-colors text-sm font-semibold ${view === 'marketplace' ? 'text-blue-400 underline underline-offset-4' : 'text-slate-300 hover:text-white'}`}
          >
            ร้านค้า
          </a>
          <a
            href="#mcp"
            onClick={(e) => { e.preventDefault(); setView('mcp'); }}
            className={`transition-colors text-sm font-semibold ${view === 'mcp' ? 'text-blue-400 underline underline-offset-4' : 'text-slate-300 hover:text-white'}`}
          >
            สำรวจ MCP
          </a>

          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-emerald-400 font-medium">@{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView('marketplace')}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold transition-all"
            >
              เข้าสู่ระบบ
            </button>
          )}

          <div className="relative cursor-pointer ml-2">
            <span className="text-xl">🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {view === 'mcp' ? (
          <MCPExplorer onBack={() => setView('marketplace')} />
        ) : (
          user ? (
            <>
              <header className="mb-12">
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">ค้นพบร้านค้าเฉพาะทาง</h2>
                <p className="text-slate-400 text-lg max-w-2xl">
                  ร้านค้าแต่ละแห่งใน OTOPS จำหน่ายสินค้าเพียงหมวดหมู่เดียวเท่านั้น
                  เลือกสินค้าที่คุณชื่นชอบและชำระสินค้าจากหลายร้านค้าพร้อมกันในตะกร้าเดียว
                </p>
              </header>

              {/* Feature Sections */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform cursor-pointer group">
                  <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">🏪</div>
                  <h3 className="text-xl font-bold mb-2">เน้นหมวดหมู่สินค้า</h3>
                  <p className="text-slate-400">หนึ่งร้านค้า หนึ่งหมวดหมู่ ความเชี่ยวชาญเฉพาะด้านเพื่อคุณภาพที่ดีที่สุด</p>
                </div>

                <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform cursor-pointer group">
                  <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">🛍️</div>
                  <h3 className="text-xl font-bold mb-2">รวมตะกร้าสินค้า</h3>
                  <p className="text-slate-400">เลือกซื้อจากหลายร้านค้าและยืนยันการชำระเงินได้ในครั้งเดียว</p>
                </div>

                <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform cursor-pointer group">
                  <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">✅</div>
                  <h3 className="text-xl font-bold mb-2">ระบบชำระเงินจำลอง</h3>
                  <p className="text-slate-400">ทดลองใช้งานระบบทั้งหมดโดยไม่มีค่าใช้จ่ายหรือการขนส่งจริง</p>
                </div>
              </section>

              {/* Product Placeholder */}
              <section className="mt-20 text-center py-20 border-2 border-dashed border-slate-700 rounded-3xl">
                <h3 className="text-2xl text-slate-500">พร้อมสำหรับการช้อปปิ้งแล้ว!</h3>
                <p className="text-slate-600 mt-2">กำลังโหลดสินค้า OTOP จากภูมิภาคต่างๆ...</p>
              </section>
            </>
          ) : (
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 mt-20">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>© 2026 OTOPS - ศูนย์การค้าออนไลน์ พัฒนาด้วย Django และ React</p>
        </div>
      </footer>
    </div>
  )
}

export default OTOPSApp
