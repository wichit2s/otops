import React, { useState, useEffect } from 'react';

const MCPExplorer = ({ onBack }) => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', command: '', args: '' });

    const fetchServers = () => {
        setLoading(true);
        fetch('/api/mcp/info/')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch MCP info');
                return res.json();
            })
            .then(data => {
                setServers(data.servers);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/api/mcp/add/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setShowAddForm(false);
                setFormData({ name: '', command: '', args: '' });
                fetchServers();
            })
            .catch(err => alert(err.message));
    };

    const handleRun = (name) => {
        fetch('/api/mcp/run/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                alert(data.message);
                setTimeout(fetchServers, 2000); // Wait a bit for status update
            })
            .catch(err => alert(err.message));
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
    );

    if (error) return (
        <div className="glass p-8 rounded-2xl text-red-400 border-red-500/30">
            <p>เกิดข้อผิดพลาด: {error}</p>
            <button onClick={onBack} className="mt-4 text-blue-400 hover:underline">กลับ</button>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-bold">สำรวจ MCP เซิร์ฟเวอร์</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-4 py-2 glass rounded-lg bg-blue-500/20 hover:bg-blue-500/40 transition-colors"
                    >
                        {showAddForm ? 'ยกเลิก' : '+ เพิ่มเซิร์ฟเวอร์'}
                    </button>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 glass rounded-lg hover:bg-white/20 transition-colors"
                    >
                        ← กลับสู่หน้าหลัก
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="glass p-8 rounded-3xl animate-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-bold mb-6 text-blue-300">เพิ่ม MCP เซิร์ฟเวอร์ใหม่</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">ชื่อเซิร์ฟเวอร์</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="เช่น weather-server"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">คำสั่ง (Command)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                value={formData.command}
                                onChange={e => setFormData({ ...formData, command: e.target.value })}
                                placeholder="เช่น npx"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">อาร์กิวเมนต์ (Arguments)</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                                value={formData.args}
                                onChange={e => setFormData({ ...formData, args: e.target.value })}
                                placeholder="เช่น -y weather-mcp"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button type="submit" className="px-8 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors">
                                บันทึกการตั้งค่า
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {servers.map(server => (
                    <div key={server.name} className="glass p-8 rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 flex gap-4 items-center">
                            {server.status !== 'running' && (
                                <button
                                    onClick={() => handleRun(server.name)}
                                    className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-full text-xs hover:bg-green-600/40 transition-colors"
                                >
                                    ▶ เริ่มทำงาน (Run)
                                </button>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${server.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                                }`}>
                                {server.status === 'running' ? 'Active' : 'Configured'}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-4 text-blue-300">{server.name}</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                            {/* Tools Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">เครื่องมือที่พร้อมใช้งาน</h4>
                                <div className="space-y-3">
                                    {server.tools.map(tool => (
                                        <div key={tool.name} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors">
                                            <code className="text-blue-400 font-mono text-sm">{tool.name}</code>
                                            <p className="text-slate-400 text-sm mt-1">{tool.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resources Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">ทรัพยากร</h4>
                                <div className="space-y-3">
                                    {server.resources.map(res => (
                                        <div key={res.uri} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <code className="text-purple-400 font-mono text-sm">{res.uri}</code>
                                            <p className="text-slate-400 text-sm mt-1">{res.description}</p>
                                        </div>
                                    ))}
                                    {server.resources.length === 0 && (
                                        <p className="text-slate-600 italic">ไม่มีทรัพยากรพร้อมใช้งาน</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MCPExplorer;
