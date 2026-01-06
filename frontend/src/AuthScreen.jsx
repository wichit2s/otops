import React, { useState } from 'react';

const AuthScreen = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('otop_token', data.token);
                localStorage.setItem('otop_user', JSON.stringify(data.user));
                onLoginSuccess(data.user, data.token);
            } else {
                setError(data.error || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <div className="glass p-8 w-full max-w-md border border-white/20">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-white/70 text-sm mb-1">อีเมล</label>
                            <input
                                type="email"
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-blue-400"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="example@email.com"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-white/70 text-sm mb-1">ชื่อผู้ใช้งาน</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-blue-400"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 text-sm mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-blue-400"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all mt-4"
                    >
                        {loading ? 'กำลังดำเนินการ...' : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white/60 hover:text-white text-sm"
                    >
                        {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
