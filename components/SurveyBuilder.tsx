
import React, { useState, useEffect } from 'react';
import { Survey, Question, QuestionType, SurveyTheme, NotificationConfig } from '../types';
import { Plus, Trash2, Save, ArrowRight, GripVertical, Settings, List, Bell, Palette, CheckSquare } from 'lucide-react';

interface SurveyBuilderProps {
  existingSurvey?: Survey | null;
  onSave: (survey: Survey) => void;
  onCancel: () => void;
}

const EmptyQuestion: Question = {
  id: '',
  type: QuestionType.SHORT_TEXT,
  text: '',
  required: true,
  options: []
};

const DefaultTheme: SurveyTheme = {
  primaryColor: '#2563eb',
  font: 'Tajawal'
};

const DefaultNotifications: NotificationConfig = {
  enabled: false,
  recipients: '',
  notifyOnCritical: false
};

const COLORS = [
  { name: 'أزرق', value: '#2563eb' },
  { name: 'أخضر', value: '#10b981' },
  { name: 'أحمر', value: '#ef4444' },
  { name: 'برتقالي', value: '#f97316' },
  { name: 'بنفسجي', value: '#8b5cf6' },
  { name: 'نيلي', value: '#0f766e' },
];

const FONTS = [
  { name: 'Tajawal (افتراضي)', value: 'Tajawal' },
  { name: 'Inter (إنجليزي)', value: 'Inter' },
  { name: 'Arial', value: 'Arial' },
];

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ existingSurvey, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [theme, setTheme] = useState<SurveyTheme>(DefaultTheme);
  const [notifications, setNotifications] = useState<NotificationConfig>(DefaultNotifications);

  useEffect(() => {
    if (existingSurvey) {
      setTitle(existingSurvey.title);
      setDescription(existingSurvey.description);
      setQuestions(existingSurvey.questions);
      setTheme(existingSurvey.theme || DefaultTheme);
      setNotifications(existingSurvey.notifications || DefaultNotifications);
    } else {
      setTitle('استبيان صيانة جديد');
      setDescription('');
      setQuestions([
        { ...EmptyQuestion, id: Date.now().toString(), text: 'ما هي المشكلة؟' }
      ]);
    }
  }, [existingSurvey]);

  const handleAddQuestion = () => {
    const newQ = { ...EmptyQuestion, id: Date.now().toString() };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    const survey: Survey = {
      id: existingSurvey ? existingSurvey.id : Date.now().toString(),
      title,
      description,
      createdAt: existingSurvey ? existingSurvey.createdAt : new Date().toISOString(),
      active: true,
      questions,
      theme,
      notifications
    };
    onSave(survey);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {existingSurvey ? 'تعديل الاستبيان' : 'إنشاء استبيان جديد'}
        </h1>
        <button onClick={onCancel} className="flex items-center text-gray-600 hover:text-gray-900 gap-2">
          <span>عودة للرئيسية</span> <ArrowRight className="w-5 h-5" /> 
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">عنوان الاستبيان</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="مثال: الفحص الشهري للسلامة"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            rows={2}
            placeholder="وصف مختصر للهدف من هذا الاستبيان..."
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'questions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <List className="w-5 h-5" /> الأسئلة
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-5 h-5" /> الإعدادات والتصميم
        </button>
      </div>

      {/* Tab Content: Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-4 animate-fade-in">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-xl"></div>
              
              <div className="flex items-start gap-4">
                <div className="mt-3 text-slate-400 cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                        className="w-full text-lg font-medium border-b-2 border-slate-100 hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent py-2 transition-colors"
                        placeholder="نص السؤال..."
                      />
                    </div>
                    <div className="md:col-span-1">
                      <select
                        value={q.type}
                        onChange={(e) => handleUpdateQuestion(q.id, 'type', e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      >
                        <option value={QuestionType.SHORT_TEXT}>نص قصير</option>
                        <option value={QuestionType.LONG_TEXT}>فقرة (نص طويل)</option>
                        <option value={QuestionType.SINGLE_CHOICE}>خيار واحد (Radio)</option>
                        <option value={QuestionType.MULTI_CHOICE}>خيارات متعددة (Checkboxes)</option>
                        <option value={QuestionType.RATING}>تقييم (1-5)</option>
                        <option value={QuestionType.DATE}>تاريخ</option>
                      </select>
                    </div>
                  </div>

                  {(q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.MULTI_CHOICE) && (
                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                         الخيارات <span className="text-xs font-normal">({q.type === QuestionType.SINGLE_CHOICE ? 'اختيار واحد فقط' : 'يمكن اختيار أكثر من خيار'})</span>
                      </label>
                      {q.options?.map((opt, optIndex) => (
                        <div key={optIndex} className="flex gap-2 items-center">
                          {q.type === QuestionType.SINGLE_CHOICE ? (
                            <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
                          )}
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...(q.options || [])];
                              newOptions[optIndex] = e.target.value;
                              handleUpdateQuestion(q.id, 'options', newOptions);
                            }}
                            className="flex-1 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm"
                          />
                          <button
                            onClick={() => {
                              const newOptions = q.options?.filter((_, i) => i !== optIndex);
                              handleUpdateQuestion(q.id, 'options', newOptions);
                            }}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleUpdateQuestion(q.id, 'options', [...(q.options || []), 'خيار جديد'])}
                        className="text-sm text-blue-600 font-medium hover:underline flex items-center mt-2"
                      >
                        <Plus className="w-4 h-4 ml-1" /> إضافة خيار
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => handleUpdateQuestion(q.id, 'required', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <span className="mr-2 text-sm text-slate-600">مطلوب (إلزامي)</span>
                    </label>
                    
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      title="حذف السؤال"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center font-medium"
          >
            <Plus className="w-5 h-5 ml-2" /> إضافة سؤال جديد
          </button>
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Theme Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Palette className="w-5 h-5 ml-2 text-blue-600" /> تخصيص المظهر
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">اللون الأساسي</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        theme.primaryColor === color.value ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {theme.primaryColor === color.value && <CheckSquare className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">نوع الخط</label>
                <select 
                  value={theme.font}
                  onChange={(e) => setTheme({ ...theme, font: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                   {FONTS.map(f => (
                     <option key={f.value} value={f.value}>{f.name}</option>
                   ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Bell className="w-5 h-5 ml-2 text-amber-500" /> نظام الإشعارات
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) => setNotifications({ ...notifications, enabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <div className="mr-3">
                  <span className="block font-medium text-slate-800">تفعيل الإشعارات البريدية</span>
                  <span className="block text-sm text-slate-500">إرسال تنبيه عند استلام ردود جديدة</span>
                </div>
              </label>

              {notifications.enabled && (
                <div className="mr-8 space-y-4 animate-fade-in-down">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني للمستلمين</label>
                    <input
                      type="text"
                      value={notifications.recipients}
                      onChange={(e) => setNotifications({ ...notifications, recipients: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@amalj.com, manager@amalj.com"
                    />
                    <p className="text-xs text-slate-400 mt-1">يمكنك إضافة أكثر من بريد بفاصلة (,)</p>
                  </div>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.notifyOnCritical}
                      onChange={(e) => setNotifications({ ...notifications, notifyOnCritical: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                    />
                    <span className="mr-2 text-sm text-slate-700 font-medium">تنبيه عاجل فقط للحالات الطارئة (تقييم 4 أو 5)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center font-medium transition-colors"
          >
            <Save className="w-5 h-5 ml-2" /> حفظ الاستبيان
          </button>
        </div>
      </div>
    </div>
  );
};
