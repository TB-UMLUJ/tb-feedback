
import React from 'react';
import { Survey, SurveyResponse, QuestionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight } from 'lucide-react';

interface AnalyticsProps {
  survey: Survey;
  responses: SurveyResponse[];
  onBack: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export const Analytics: React.FC<AnalyticsProps> = ({ survey, responses, onBack }) => {
  
  // Helper to aggregate data for charts
  const getAggregatedData = (questionId: string) => {
    const counts: Record<string, number> = {};
    responses.forEach(r => {
      const val = r.answers[questionId];
      if (Array.isArray(val)) {
        val.forEach(v => {
            const key = String(v);
            counts[key] = (counts[key] || 0) + 1;
        });
      } else if (val !== undefined && val !== null && val !== '') {
        const key = String(val);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getRecentTextAnswers = (questionId: string) => {
    return responses
      .filter(r => r.answers[questionId])
      .map(r => ({ text: r.answers[questionId], time: r.timestamp }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 space-y-8" dir="rtl">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="ml-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowRight className="w-6 h-6 text-slate-600" />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-slate-800">التحليلات والتقارير</h1>
            <p className="text-slate-500">{survey.title} • {responses.length} استجابة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {survey.questions.map((q) => {
            const data = getAggregatedData(q.id);
            
            // Render different visualizations based on question type
            if (q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.MULTI_CHOICE || q.type === QuestionType.RATING) {
                return (
                    <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{q.text}</h3>
                        <div className="h-64 w-full" dir="ltr"> {/* Charts often render better in LTR containers internally */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                      dataKey="name" 
                                      type="category" 
                                      width={100} 
                                      tick={{fontSize: 12, fill: '#64748b'}} 
                                      orientation="right" // Put labels on right for RTL feel
                                    />
                                    <Tooltip 
                                      cursor={{fill: 'transparent'}}
                                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right'}} 
                                    />
                                    <Bar dataKey="value" radius={[4, 0, 0, 4]} barSize={32}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            } else if (q.type === QuestionType.SHORT_TEXT || q.type === QuestionType.LONG_TEXT) {
                const recent = getRecentTextAnswers(q.id);
                return (
                    <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                         <h3 className="text-lg font-bold text-slate-800 mb-4">{q.text}</h3>
                         <div className="space-y-3">
                            {recent.length === 0 ? (
                                <p className="text-slate-400 italic">لا توجد إجابات بعد.</p>
                            ) : (
                                recent.map((ans, idx) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                                        <p className="text-slate-700">{String(ans.text)}</p>
                                        <p className="text-xs text-slate-400 mt-2 text-left">
                                          {new Date(String(ans.time)).toLocaleDateString('ar-SA')}
                                        </p>
                                    </div>
                                ))
                            )}
                         </div>
                    </div>
                );
            }
            return null;
        })}
      </div>
    </div>
  );
};
