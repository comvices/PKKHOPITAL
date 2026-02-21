import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, ExternalLink, Edit2, Trash2, Hospital, Loader2, 
  Github, GitCommit, Star, GitFork, CheckCircle2, AlertCircle, 
  X, Filter, LayoutGrid, List as ListIcon, ShieldCheck, Stethoscope, 
  Settings, HelpCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Department } from './types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({ 
    name: '', url: '', category: 'other', status: 'active' 
  });
  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchGithubData = async () => {
    setGithubLoading(true);
    try {
      const res = await fetch('/api/github/repo');
      if (res.ok) {
        const data = await res.json();
        setGithubData(data);
      }
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
    } finally {
      setGithubLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || dept.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [departments, searchQuery, filterCategory]);

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ 
        name: dept.name, 
        url: dept.url, 
        category: dept.category, 
        status: dept.status 
      });
    } else {
      setEditingDept(null);
      setFormData({ 
        name: '', 
        url: '', 
        category: 'other', 
        status: 'active' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({ name: '', url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingDept ? 'PUT' : 'POST';
    const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchDepartments();
        handleCloseModal();
        addToast(editingDept ? 'อัปเดตข้อมูลสำเร็จ' : 'เพิ่มแผนกใหม่สำเร็จ', 'success');
      } else {
        addToast('ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Failed to save department:', error);
      addToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบแผนกนี้?')) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDepartments();
        addToast('ลบแผนกเรียบร้อยแล้ว', 'success');
      } else {
        addToast('ไม่สามารถลบข้อมูลได้', 'error');
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
      addToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return <Stethoscope size={18} />;
      case 'support': return <HelpCircle size={18} />;
      case 'admin': return <ShieldCheck size={18} />;
      default: return <Settings size={18} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'medical': return 'การแพทย์';
      case 'support': return 'สนับสนุน';
      case 'admin': return 'บริหาร';
      default: return 'อื่นๆ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'maintenance': return 'bg-amber-500';
      case 'offline': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg text-white">
              <Hospital size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">แผนก</h1>
              <p className="text-sm text-slate-500">โรงพยาบาลประจวบคีรีขันธ์</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            เพิ่มแผนก
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {/* Toast Notifications */}
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[200px] ${
                  toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-medium">{toast.message}</span>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="ml-auto hover:bg-white/20 p-1 rounded-lg"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* GitHub Status Section */}
        {githubData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl">
                  <Github size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {githubData.name}
                    <a href={githubData.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  </h2>
                  <p className="text-slate-400 text-sm">{githubData.description || 'No description provided.'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" />
                  <span className="font-bold">{githubData.stars}</span>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                  <GitFork size={16} className="text-blue-400" />
                  <span className="font-bold">{githubData.forks}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border-t border-white/10 p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <GitCommit size={14} /> Recent Commits
              </h3>
              <div className="space-y-3">
                {githubData.recentCommits.map((commit: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-4 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                        {commit.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {commit.author} • {new Date(commit.date).toLocaleDateString()}
                      </p>
                    </div>
                    <a href={commit.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-teal-400 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหาชื่อแผนก..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon size={20} />
              </button>
            </div>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="medical">การแพทย์</option>
              <option value="support">สนับสนุน</option>
              <option value="admin">บริหาร</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>

        {/* Grid/List View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredDepartments.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
            <AnimatePresence mode="popLayout">
              {filteredDepartments.map((dept) => (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 flex transition-all group ${
                    viewMode === 'grid' 
                      ? 'flex-col justify-between h-52 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5' 
                      : 'items-center justify-between hover:border-teal-500/30'
                  }`}
                >
                  <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1 min-w-0' : ''}>
                    <div className={`flex items-center gap-2 mb-2 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                        {getCategoryIcon(dept.category)}
                      </div>
                      <div className={viewMode === 'list' ? 'flex flex-col min-w-0' : ''}>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-700 transition-colors truncate">
                          {dept.name}
                        </h3>
                        {viewMode === 'list' && (
                          <p className="text-xs text-slate-400 truncate font-mono">
                            {dept.url}
                          </p>
                        )}
                      </div>
                    </div>
                    {viewMode === 'grid' && (
                      <p className="text-xs text-slate-400 truncate font-mono bg-slate-50 px-2 py-1 rounded inline-block max-w-full mb-3">
                        {dept.url}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        {getCategoryLabel(dept.category)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(dept.status)}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {dept.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between mt-auto ${viewMode === 'list' ? 'mt-0 gap-4' : ''}`}>
                    <a
                      href={dept.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 font-bold text-sm flex items-center gap-1.5 hover:underline"
                    >
                      เข้าหน้าแผนก <ExternalLink size={14} />
                    </a>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-slate-800 font-medium text-lg">ไม่พบข้อมูลแผนก</h3>
            <p className="text-slate-400">ลองค้นหาด้วยคำอื่น หรือเพิ่มแผนกใหม่</p>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingDept ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
                </h2>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อแผนก</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น แผนกฉุกเฉิน, ห้องยา"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ลิงก์ภายใน (URL)</label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://internal-system.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">หมวดหมู่</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                    >
                      <option value="medical">การแพทย์</option>
                      <option value="support">สนับสนุน</option>
                      <option value="admin">บริหาร</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">สถานะ</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                    >
                      <option value="active">ปกติ (Active)</option>
                      <option value="maintenance">ปรับปรุง (Maintenance)</option>
                      <option value="offline">ปิดปรับปรุง (Offline)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-600/20"
                  >
                    {editingDept ? 'บันทึกการแก้ไข' : 'เพิ่มแผนก'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-400">
            ระบบจัดการลิงก์ภายใน &copy; {new Date().getFullYear()} โรงพยาบาลประจวบคีรีขันธ์
          </p>
        </div>
      </footer>
    </div>
  );
}
