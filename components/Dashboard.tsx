
import React from 'react';
import { Survey, SurveyResponse } from '../types';
import { Plus, BarChart2, Share2, ClipboardList, Trash2, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  surveys: Survey[];
  responses: SurveyResponse[];
  onCreateSurvey: () => void;
  onTakeSurvey: (survey: Survey) => void;
  onViewStats: (survey: Survey) => void;
  onDeleteSurvey: (id: string) => void;
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('ar-SA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  surveys, 
  responses, 
  onCreateSurvey, 
  onTakeSurvey, 
  onViewStats,
  onDeleteSurvey 
}) => {
  
  const getResponseCount = (surveyId: string) => {
    return responses.filter(r => r.surveyId === surveyId).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">لوحة التحكم</h1>
          <p className="text-slate-500 mt-1">إدارة استبيانات وبلاغات الصيانة لمستشفى أملج.</p>
        </div>
        <button
          onClick={onCreateSurvey}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center font-medium"
        >
          <Plus className="w-5 h-5 ml-2" /> استبيان جديد
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{surveys.length}</div>
            <div className="text-sm text-slate-500 font-medium">الاستبيانات النشطة</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{responses.length}</div>
            <div className="text-sm text-slate-500 font-medium">إجمالي الاستجابات</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{Math.floor(responses.length / Math.max(surveys.length, 1))}</div>
            <div className="text-sm text-slate-500 font-medium">متوسط الردود / استبيان</div>
          </div>
        </div>
      </div>

      {/* Survey List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">الاستبيانات الخاصة بك</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {surveys.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
              <p className="text-slate-500 mb-4">لم يتم إنشاء أي استبيان بعد.</p>
              <button onClick={onCreateSurvey} className="text-blue-600 font-medium hover:underline">أنشئ أول استبيان</button>
            </div>
          ) : (
            surveys.map(survey => (
              <div key={survey.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{survey.title}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">نشط</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-1">{survey.description || 'لا يوجد وصف.'}</p>
                  <div className="flex items-center text-xs text-slate-400 space-x-4">
                    <span>تم الإنشاء {formatDate(survey.createdAt)}</span>
                    <span>•</span>
                    <span>{getResponseCount(survey.id)} استجابة</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                   <button 
                    onClick={() => onTakeSurvey(survey)}
                    className="flex-1 md:flex-none px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center justify-center"
                  >
                    عرض الاستبيان <ArrowLeft className="w-4 h-4 mr-2 opacity-50" />
                  </button>
                  <button 
                    onClick={() => onViewStats(survey)}
                    className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                  >
                    <BarChart2 className="w-4 h-4 ml-2" /> التحليل
                  </button>
                  <button 
                    onClick={() => {
                        if(window.confirm('هل أنت متأكد من حذف هذا الاستبيان؟')) {
                            onDeleteSurvey(survey.id);
                        }
                    }}
                    className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
