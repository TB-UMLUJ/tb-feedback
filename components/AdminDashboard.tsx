import React, { useState, useEffect } from 'react';
import { SurveyResponse, ReportStatus } from '../types';
import { surveyService, supabase } from '../services/surveyService';
import { 
  Lock, Unlock, ArrowRight, Copy, Check, MapPin, 
  User, FileText, Image as ImageIcon, RefreshCw,
  LayoutDashboard, BarChart3, QrCode, Search, Filter, Printer,
  Download, AlertTriangle, Save, Clock, Trash2, Link, X,
  PieChart as PieChartIcon, Bell, BellOff
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie, Legend
} from 'recharts';

interface AdminDashboardProps {
  onBack: () => void;
}

const STATUS_COLORS = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  archived: 'bg-slate-700/50 text-slate-400 border-slate-600'
};

const STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  archived: 'مؤرشف'
};

const PRIORITIES: Record<string, string> = {
  normal: 'عادي',
  high: 'عالي',
  critical: 'طارئ'
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'analytics' | 'qr'>('board');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(Notification.permission);
  
  // QR Tab State
  const [qrUrl, setQrUrl] = useState(window.location.href);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // UI States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [printResponse, setPrintResponse] = useState<SurveyResponse | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      
      // Update permission state
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      if (supabase) {
        const channel = supabase
          .channel('realtime_reports_erp')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_requests' }, (payload) => {
             // Reload data
             loadData();
             
             // Handle Notifications
             if (payload.eventType === 'INSERT') {
                sendBrowserNotification('بلاغ صيانة جديد 🚨', `رقم البلاغ: #${payload.new.report_id || 'جديد'}`);
             } else if (payload.eventType === 'DELETE') {
                sendBrowserNotification('تم حذف بلاغ 🗑️', 'تمت إزالة أحد البلاغات من النظام');
             }
          })
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      }
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await surveyService.fetchResponses();
    setResponses(data);
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Aa1020304050!') setIsAuthenticated(true);
    else {
        alert('كلمة المرور غير صحيحة');
        setPasscode('');
    } 
  };

  // --- Notification Logic ---
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('هذا المتصفح لا يدعم الإشعارات.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      new Notification('تم تفعيل الإشعارات بنجاح ✅', {
        body: 'ستصلك تنبيهات عند إضافة أو حذف أي بلاغ.',
      });
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
       // Play a subtle sound
       const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
       audio.volume = 0.5;
       audio.play().catch(() => {}); // Catch play errors (browsers might block auto-play)

       // Show notification
       new Notification(title, {
         body: body,
         icon: 'https://cdn-icons-png.flaticon.com/512/10309/10309221.png', // Bell Icon
       });
    }
  };

  // --- Actions ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setResponses(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as ReportStatus } : r));
    await surveyService.updateResponseStatus(id, newStatus);
  };

  const handleSaveNote = async (id: string) => {
    setResponses(prev => prev.map(r => r.id === id ? { ...r, internal_notes: noteText } : r));
    await surveyService.updateResponseNotes(id, noteText);
    setEditingNoteId(null);
  };

  const handleDeleteClick = (id: string) => {
      setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
      if (!deleteConfirmId) return;
      const id = deleteConfirmId;
      console.log('Confirming delete for:', id);
      
      try {
          // Optimistic delete
          setResponses(prev => prev.filter(r => r.id !== id));
          await surveyService.deleteResponse(id);
          console.log('Delete successful');
          setDeleteConfirmId(null);
      } catch (error: any) {
          console.error('Delete failed:', error);
          alert(`فشل الحذف: ${error.message || 'يرجى التحقق من صلاحيات قاعدة البيانات'}`);
          loadData(); // Revert on error
          setDeleteConfirmId(null);
      }
  };

  const handleCopy = (response: SurveyResponse) => {
    const text = `🚨 *بلاغ صيانة #${response.id}#*
👤 *الاسم:* ${response.answers['name']}
📍 *الموقع:* ${response.answers['location']}
📝 *التفاصيل:* ${response.answers['details']}
🏷 *الحالة:* ${STATUS_LABELS[response.status || 'new']}
📅 *التاريخ:* ${new Date(response.timestamp).toLocaleDateString('ar-SA')}
${response.answers['image'] ? `📷 *رابط الصورة:* ${response.answers['image']}` : ''}`;
    
    navigator.clipboard.writeText(text);
    setCopiedId(response.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Filtering ---
  const filteredResponses = responses.filter(r => {
    const matchesSearch = 
      r.id.includes(searchQuery) || 
      String(r.answers['name']).includes(searchQuery) ||
      String(r.answers['location']).includes(searchQuery) ||
      String(r.answers['details']).includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // --- Analytics Data ---
  const locationData = Object.entries(responses.reduce((acc: Record<string, number>, curr) => {
    const loc = String(curr.answers['location'] || 'غير محدد').trim();
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>))
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => (b.value as number) - (a.value as number))
  .slice(0, 5);

  const categoryData = Object.entries(responses.reduce((acc: Record<string, number>, curr) => {
    const cat = String(curr.answers['category'] || 'غير محدد');
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>))
  .map(([name, value]) => ({ name, value }));

  const COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#f43f5e', '#10b981'];

  // --- Auth Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1121] p-4" dir="rtl" style={{ fontFamily: 'El Messiri, sans-serif' }}>
        <div className="max-w-md w-full glass-card p-8 rounded-3xl text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-700">
            <Lock className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">لوحة التحكم</h2>
          <p className="text-slate-400 mb-8">أدخل كلمة المرور للوصول إلى لوحة الإدارة</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl text-center text-xl tracking-widest focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              placeholder="كلمة المرور"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" /> دخول
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 text-slate-500 hover:text-white transition-colors"
            >
              عودة للاستبيان
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Print View (Work Order) ---
  if (printResponse) {
    return (
      <div className="fixed inset-0 z-50 bg-white text-black overflow-y-auto" dir="rtl" style={{ fontFamily: 'El Messiri, sans-serif' }}>
        <div className="max-w-3xl mx-auto p-8 border min-h-screen">
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">أمر عمل صيانة</h1>
                    <p className="text-gray-600">Work Order Request</p>
                </div>
                <div className="text-left">
                    <p className="font-bold text-xl">#{printResponse.id}</p>
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('ar-SA')}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border p-4 rounded">
                    <h3 className="font-bold mb-2 border-b pb-1">معلومات البلاغ</h3>
                    <p className="mb-1"><span className="font-semibold">الموقع:</span> {String(printResponse.answers['location'] || '')}</p>
                    <p className="mb-1"><span className="font-semibold">المبلغ:</span> {String(printResponse.answers['name'] || '')}</p>
                    <p className="mb-1"><span className="font-semibold">التاريخ:</span> {new Date(printResponse.timestamp).toLocaleString('ar-SA')}</p>
                    <p className="mb-1"><span className="font-semibold">الأولوية:</span> {PRIORITIES[printResponse.priority || 'normal']}</p>
                </div>
                <div className="border p-4 rounded">
                    <h3 className="font-bold mb-2 border-b pb-1">الحالة الحالية</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 border border-black rounded-sm"></div> جديد
                        <div className="w-4 h-4 border border-black rounded-sm ml-2"></div> قيد التنفيذ
                        <div className="w-4 h-4 border border-black rounded-sm ml-2"></div> مكتمل
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="font-bold mb-2 text-lg">تفاصيل العطل:</h3>
                <div className="border p-4 rounded min-h-[100px] bg-gray-50">
                    {String(printResponse.answers['details'] || '')}
                </div>
            </div>

            {printResponse.answers['image'] && (
                <div className="mb-8 page-break-inside-avoid">
                    <h3 className="font-bold mb-2 text-lg">الصورة المرفقة:</h3>
                    <img 
                        src={String(printResponse.answers['image'])} 
                        alt="Evidence" 
                        className="max-h-[300px] border rounded mx-auto"
                    />
                </div>
            )}

            <div className="mt-12 border-t-2 border-black pt-4 grid grid-cols-2 gap-12">
                <div>
                    <p className="font-bold mb-8">اسم الفني:</p>
                    <div className="border-b border-black"></div>
                </div>
                <div>
                    <p className="font-bold mb-8">التوقيع:</p>
                    <div className="border-b border-black"></div>
                </div>
            </div>

            <div className="fixed top-4 left-4 print:hidden flex gap-2">
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center gap-2">
                    <Printer className="w-4 h-4" /> طباعة
                </button>
                <button onClick={() => setPrintResponse(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow">
                    إغلاق
                </button>
            </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard View ---
  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-100" dir="rtl" style={{ fontFamily: 'El Messiri, sans-serif' }}>
      {/* Top Navbar */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              لوحة التحكم
            </h1>
          </div>

          {/* Notification Toggle Button */}
          <button
            onClick={requestNotificationPermission}
            className={`p-2 rounded-lg transition-all border ${
              notificationPermission === 'granted' 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'
            }`}
            title={notificationPermission === 'granted' ? 'الإشعارات مفعلة' : 'تفعيل الإشعارات'}
          >
            {notificationPermission === 'granted' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-32">
        
        {/* === BOARD TAB === */}
        {activeTab === 'board' && (
          <div className="space-y-6 animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-1 gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="بحث برقم البلاغ، الاسم، الموقع..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                        />
                    </div>
                    <div className="relative min-w-[160px]">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pr-9 pl-4 text-slate-200 appearance-none focus:border-cyan-500 outline-none cursor-pointer"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="new">جديد</option>
                            <option value="in_progress">قيد التنفيذ</option>
                            <option value="completed">مكتمل</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex gap-2">
                     <button 
                        onClick={() => surveyService.exportToCSV(responses)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                     >
                        <Download className="w-4 h-4" /> تصدير CSV
                     </button>
                     <button 
                        onClick={loadData}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
                     >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                     </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <div key={key} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">{label}</p>
                            <p className="text-2xl font-bold text-white">{responses.filter(r => (r.status || 'new') === key).length}</p>
                        </div>
                        <div className={`w-2 h-10 rounded-full ${STATUS_COLORS[key as keyof typeof STATUS_COLORS].split(' ')[0]}`}></div>
                    </div>
                ))}
            </div>

            {/* Responses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResponses.map((response) => (
                    <div key={response.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col">
                        {/* Card Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-900/80">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-cyan-400 font-mono font-bold text-lg" dir="ltr">#{response.id}</span>
                                    {response.answers['image'] && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(response.timestamp).toLocaleDateString('ar-SA', { 
                                        day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' 
                                    })}
                                </div>
                            </div>
                            
                            <select
                                value={response.status || 'new'}
                                onChange={(e) => handleStatusChange(response.id, e.target.value)}
                                className={`text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 appearance-none cursor-pointer outline-none ${STATUS_COLORS[(response.status || 'new') as keyof typeof STATUS_COLORS]}`}
                            >
                                <option value="new">جديد</option>
                                <option value="in_progress">جاري التنفيذ</option>
                                <option value="completed">مكتمل</option>
                                <option value="archived">أرشيف</option>
                            </select>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3 flex-1">
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                                <span className="text-slate-200 text-sm font-medium">{String(response.answers['name'] || '')}</span>
                                <span className="text-slate-500 text-xs px-2 py-0.5 bg-slate-800 rounded-full">{String(response.answers['category'] || '')}</span>
                            </div>
                            
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                                <span className="text-slate-300 text-sm">{String(response.answers['location'] || '')}</span>
                            </div>

                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300 relative group/details">
                                <FileText className="w-4 h-4 text-slate-600 absolute top-3 left-3" />
                                <p className="line-clamp-3 pl-6">{String(response.answers['details'] || '')}</p>
                            </div>

                            {/* Internal Notes */}
                            <div className="mt-2 pt-2 border-t border-slate-800/50">
                                {editingNoteId === response.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            className="flex-1 bg-slate-800 text-xs text-white p-2 rounded border border-slate-700 outline-none focus:border-cyan-500"
                                            placeholder="أضف ملاحظة..."
                                            autoFocus
                                        />
                                        <button onClick={() => handleSaveNote(response.id)} className="text-cyan-400 hover:text-cyan-300"><Save className="w-4 h-4" /></button>
                                        <button onClick={() => setEditingNoteId(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => {
                                            setEditingNoteId(response.id);
                                            setNoteText(response.internal_notes || '');
                                        }}
                                        className="text-xs text-slate-500 cursor-pointer hover:text-cyan-400 flex items-center gap-1"
                                    >
                                        <AlertTriangle className="w-3 h-3" />
                                        {response.internal_notes ? response.internal_notes : "إضافة ملاحظة داخلية..."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-3 bg-slate-900/30 border-t border-slate-800 flex gap-2 justify-end">
                             {response.answers['image'] && (
                                <a 
                                    href={String(response.answers['image'])} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                                    title="عرض الصورة"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </a>
                            )}
                            <button 
                                onClick={() => setPrintResponse(response)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                title="طباعة أمر عمل"
                            >
                                <Printer className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleCopy(response)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors relative"
                                title="نسخ التفاصيل"
                            >
                                {copiedId === response.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(response.id);
                                }}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors relative z-20"
                                title="حذف البلاغ"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredResponses.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <p>لا توجد بلاغات تطابق البحث.</p>
                </div>
            )}
          </div>
        )}

        {/* === ANALYTICS TAB === */}
        {activeTab === 'analytics' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Location Heatmap */}
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 min-w-0 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-rose-500" /> أكثر المواقع تضرراً
                        </h3>
                        <div className="flex-1 min-h-[300px] w-full" dir="ltr">
                            {locationData.length > 0 ? (
                                <ResponsiveContainer width="99%" height="100%">
                                    <BarChart data={locationData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 11}} />
                                        <Tooltip 
                                            contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {locationData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                    <BarChart3 className="w-8 h-8 opacity-20" />
                                    <p>لا توجد بيانات كافية للتحليل</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 min-w-0 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-purple-500" /> توزيع الفئات
                        </h3>
                        <div className="flex-1 min-h-[300px] w-full" dir="ltr">
                             {categoryData.length > 0 ? (
                                <ResponsiveContainer width="99%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                                        <Legend />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                             ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                    <PieChartIcon className="w-8 h-8 opacity-20" />
                                    <p>لا توجد بيانات كافية للتحليل</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === QR TAB === */}
        {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-fade-in">
                
                {/* Link Editor */}
                <div className="w-full max-w-md bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                        <Link className="w-4 h-4" /> رابط الباركود المستهدف:
                    </label>
                    <input 
                        type="text" 
                        value={qrUrl}
                        onChange={(e) => setQrUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-left font-mono text-sm mb-2"
                    />
                    <p className="text-xs text-slate-500">
                        يمكنك تغيير هذا الرابط لتوجيه الباركود لصفحة أخرى إذا لزم الأمر.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-cyan-500/10">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`} 
                        alt="QR Code" 
                        className="w-64 h-64"
                    />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">امسح للوصول للاستبيان</h2>
                    <p className="text-slate-400 mb-6 font-mono text-sm max-w-md truncate">{qrUrl}</p>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(qrUrl);
                            alert('تم نسخ الرابط!');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-all border border-slate-700"
                    >
                        نسخ الرابط
                    </button>
                </div>
            </div>
        )}

      </main>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-3xl shadow-2xl shadow-black/50 z-50">
        <div className="flex justify-around items-center relative">
          
          <button 
            onClick={() => setActiveTab('board')}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all relative z-10 ${activeTab === 'board' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
             {activeTab === 'board' && <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full"></div>}
             <LayoutDashboard className={`w-6 h-6 mb-1 ${activeTab === 'board' ? 'text-cyan-400' : ''}`} />
             <span className="text-[10px] font-bold">البلاغات</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all relative z-10 ${activeTab === 'analytics' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
             {activeTab === 'analytics' && <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full"></div>}
             <BarChart3 className={`w-6 h-6 mb-1 ${activeTab === 'analytics' ? 'text-purple-400' : ''}`} />
             <span className="text-[10px] font-bold">التحليلات</span>
          </button>

          <button 
            onClick={() => setActiveTab('qr')}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all relative z-10 ${activeTab === 'qr' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
             {activeTab === 'qr' && <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full"></div>}
             <QrCode className={`w-6 h-6 mb-1 ${activeTab === 'qr' ? 'text-emerald-400' : ''}`} />
             <span className="text-[10px] font-bold">الباركود</span>
          </button>

        </div>
      </nav>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#0b1121] border border-red-500/30 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">تأكيد الحذف</h3>
                    <p className="text-slate-400 mb-6 text-sm">
                        هل أنت متأكد من حذف هذا البلاغ رقم <span className="text-red-400 font-mono text-base mx-1">{deleteConfirmId}#</span>؟ 
                        <br/>لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors"
                        >
                            حذف نهائي
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};