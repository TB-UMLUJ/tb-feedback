
import React, { useState, useRef } from 'react';
import { Survey, Question, QuestionType, SurveyResponse } from '../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  User, 
  Briefcase, 
  MapPin, 
  FileText, 
  Camera,
  Stars,
  Hash,
  Lock,
  RefreshCcw
} from 'lucide-react';

interface SurveyViewerProps {
  survey: Survey;
  onSubmit: (response: SurveyResponse) => Promise<void>; // Updated to Promise
  onExit: () => void;
  onOpenAdmin: () => void;
}

export const SurveyViewer: React.FC<SurveyViewerProps> = ({ survey, onSubmit, onOpenAdmin }) => {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportId, setReportId] = useState<string>('');
  
  // Ref to help with scrolling
  const questionContainerRef = useRef<HTMLDivElement>(null);

  // Default logo if not fetched from DB
  const logoUrl = "https://cdn-icons-png.flaticon.com/512/3063/3063823.png"; 

  const primaryColor = survey.theme?.primaryColor || '#22d3ee';
  const fontFamily = 'El Messiri';

  const totalSteps = survey.questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setReportId('');
    setStarted(false);
    window.scrollTo(0, 0);
  };

  // Function to handle input focus on mobile to prevent keyboard overlap
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Delay slightly to allow the keyboard to pop up and resize the viewport
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Generate 7-digit Report ID
    const generatedReportId = Math.floor(1000000 + Math.random() * 9000000).toString();
    setReportId(generatedReportId);

    const response: SurveyResponse = {
      id: generatedReportId, // Use the Report ID as the response ID
      surveyId: survey.id,
      answers,
      timestamp: new Date().toISOString()
    };
    
    try {
      await onSubmit(response);
      // Only set submitted if no error thrown
      setIsSubmitted(true);
    } catch (e) {
      // Error is handled in App.tsx via alert
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionIcon = (id: string, type: QuestionType) => {
    switch (id) {
        case 'name': return <User className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />;
        case 'category': return <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />;
        case 'location': return <MapPin className="w-8 h-8 md:w-10 md:h-10 text-rose-400" />;
        case 'details': return <FileText className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />;
        default: 
            if (type === QuestionType.IMAGE) return <Camera className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />;
            return <Stars className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />;
    }
  };

  // --- WELCOME SCREEN ---
  if (!started) {
    return (
      <div 
        className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden" 
        dir="rtl"
        style={{ fontFamily }}
      >
        {/* Admin Lock Button */}
        <button 
            onClick={onOpenAdmin}
            className="absolute top-6 left-6 p-3 rounded-full bg-slate-800/50 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors z-50 border border-slate-700/30"
            title="دخول المشرفين"
        >
            <Lock className="w-5 h-5" />
        </button>

        {/* Modern Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        <div className="z-10 glass-card p-8 md:p-12 rounded-[2rem] max-w-lg w-full relative group mt-10">
            {/* Logo / Icon - Background Removed */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <span className="text-[6rem] drop-shadow-2xl animate-bounce-slow block filter hover:scale-110 transition-transform duration-300 cursor-default">👋</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 mt-12 leading-relaxed tracking-wide">
              مرحبا بك !
            </h1>
            <p className="text-slate-400 mb-10 text-lg md:text-xl font-light">
              يمكنك البدء عندما تكون مستعداً
            </p>
            
            <button
              onClick={() => setStarted(true)}
              className="w-full py-5 text-xl font-bold text-white rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 relative overflow-hidden"
            >
              <span className="relative z-10">ابدأ الاستبيان</span>
              <ArrowLeft className="w-6 h-6 relative z-10" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
        </div>
      </div>
    );
  }

  // --- THANK YOU SCREEN ---
  if (isSubmitted) {
    return (
      <div 
        className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-6 text-center animate-fade-in" 
        dir="rtl"
        style={{ fontFamily }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] max-w-lg w-full relative overflow-hidden border-t border-white/10">
            {/* Logo Section */}
            <div className="mb-8 flex justify-center relative">
                 <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
                 <div className="w-28 h-28 glass rounded-full flex items-center justify-center p-5 relative ring-1 ring-white/10">
                    <img 
                        src={logoUrl} 
                        alt="Hospital Logo" 
                        className="w-full h-full object-contain filter drop-shadow-md"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('hidden');
                        }}
                    />
                    <CheckCircle2 className="w-12 h-12 text-green-400 hidden" />
                 </div>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-6">
                شكراً لمشاركتكم!
            </h2>
            
            <div className="text-slate-300/80 mb-8 text-base md:text-lg leading-relaxed font-light">
                <p>ملاحظاتكم تمثّل ركيزة أساسية لتحسين بيئة المستشفى</p>
                <p>ورفـع جـودة الـخدمات المـقدّمة للـمرضى والـمراجعين.</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
                <div className="flex flex-row items-center justify-center gap-3 relative z-10 flex-wrap">
                    <p className="text-slate-400 text-base md:text-lg flex items-center gap-2 whitespace-nowrap">
                        <Hash className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" /> رقم البلاغ:
                    </p>
                    <p className="text-2xl md:text-4xl font-mono font-bold text-white tracking-widest drop-shadow-lg whitespace-nowrap" dir="ltr">
                      {reportId}#
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 rounded-full animate-pulse"></div>
            </div>
            
            <button 
                onClick={handleRestart}
                className="mt-8 px-8 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 mx-auto border border-slate-700 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 group"
            >
                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> 
                تسجيل بلاغ جديد
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentStep];
  const currentAnswer = answers[currentQuestion.id];
  
  let canProceed = !currentQuestion.required;
  if (currentQuestion.required) {
    if (currentQuestion.type === QuestionType.IMAGE) {
        canProceed = !!currentAnswer;
    } else {
        canProceed = currentAnswer !== undefined && currentAnswer !== '';
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1121] text-slate-100 overflow-x-hidden overflow-y-auto" dir="rtl" style={{ fontFamily }}>
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 z-50"></div>
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0b1121] to-transparent pointer-events-none z-10"></div>

      {/* Header / Progress */}
      <div className="fixed top-4 left-0 right-0 z-30 px-4 md:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between glass px-4 py-3 rounded-2xl">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                {currentStep + 1} / {totalSteps}
            </span>
            <div className="h-1.5 w-32 md:w-48 bg-slate-700/50 rounded-full overflow-hidden" dir="ltr">
                <div 
                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={questionContainerRef}
        className="flex-1 flex flex-col justify-center px-4 md:px-8 pt-24 pb-48 max-w-2xl mx-auto w-full relative z-20 min-h-[90vh]"
      >
        <div key={currentQuestion.id} className="animate-fade-in-up">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 glass rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 ring-1 ring-white/5">
                {getQuestionIcon(currentQuestion.id, currentQuestion.type)}
            </div>
            
            <label className="block text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight tracking-wide drop-shadow-md">
                {currentQuestion.text}
            </label>
            
            {currentQuestion.description && (
                <p className="text-slate-400 text-sm md:text-base font-light px-4 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                    {currentQuestion.description}
                </p>
            )}
          </div>

          <div className="mt-2 w-full">
            {renderInput(currentQuestion, currentAnswer, handleAnswer, primaryColor, handleInputFocus)}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-30 bg-gradient-to-t from-[#0b1121] via-[#0b1121] to-transparent">
        <div className="max-w-2xl mx-auto flex gap-4 items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border border-slate-700/50 glass 
              ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-800 text-slate-300 hover:text-white active:scale-95'}`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`flex-1 h-14 rounded-2xl font-bold text-lg md:text-xl shadow-lg transition-all flex items-center justify-center relative overflow-hidden group
              ${canProceed && !isSubmitting 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/25 active:scale-[0.98]' 
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}
          >
            {isSubmitting ? (
                <div className="flex gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                </div>
            ) : (
                <>
                    <span className="ml-2 relative z-10">{currentStep === totalSteps - 1 ? 'إرسال البلاغ' : 'التالي'}</span>
                    {currentStep !== totalSteps - 1 && <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />}
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const renderInput = (
  question: Question,
  value: any,
  onChange: (id: string, val: any) => void,
  primaryColor: string,
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
) => {
  switch (question.type) {
    case QuestionType.SHORT_TEXT:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          onFocus={onFocus}
          className="w-full text-lg md:text-2xl text-center bg-slate-800/40 border border-slate-600/50 text-white rounded-2xl px-6 py-5 focus:border-cyan-500 focus:bg-slate-800/60 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-slate-600 shadow-inner"
          placeholder="اكتب هنا..."
          autoFocus
        />
      );
    
    case QuestionType.LONG_TEXT:
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          onFocus={onFocus}
          className="w-full text-lg md:text-xl bg-slate-800/40 border border-slate-600/50 text-white rounded-2xl p-6 focus:border-cyan-500 focus:bg-slate-800/60 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all placeholder-slate-600 shadow-inner min-h-[180px] resize-none"
          rows={5}
          placeholder="اكتب التفاصيل هنا..."
          autoFocus
        />
      );

    case QuestionType.SINGLE_CHOICE:
      return (
        <div className="space-y-4 w-full">
          {question.options?.map((option) => (
            <label
              key={option}
              className={`flex items-center p-4 md:p-6 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden backdrop-blur-sm`}
              style={{ 
                  borderColor: value === option ? primaryColor : 'rgba(71, 85, 105, 0.3)', // Slate-700 alpha
                  backgroundColor: value === option ? 'rgba(34, 211, 238, 0.08)' : 'rgba(30, 41, 59, 0.4)', // Slate-800 alpha
              }}
            >
              <div 
                className={`w-6 h-6 rounded-full border-2 ml-5 flex items-center justify-center flex-shrink-0 transition-all`}
                style={{ borderColor: value === option ? primaryColor : '#64748b' }}
              >
                {value === option && <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: primaryColor }} />}
              </div>
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(question.id, option)}
                className="hidden"
              />
              <span className={`text-lg md:text-2xl font-medium transition-colors ${value === option ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{option}</span>
            </label>
          ))}
        </div>
      );

      case QuestionType.IMAGE:
        return (
            <div className="w-full">
                <label 
                    className={`flex flex-col items-center justify-center w-full h-64 md:h-80 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all relative overflow-hidden group ${value ? 'border-solid border-cyan-500/50 bg-slate-800/50' : 'border-slate-600/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-cyan-400/30'}`}
                >
                    {value ? (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                             {typeof value === 'object' && value instanceof File ? (
                                <img 
                                    src={URL.createObjectURL(value)} 
                                    alt="Preview" 
                                    className="h-full w-full object-contain rounded-2xl shadow-2xl" 
                                />
                             ) : (
                                <div className="text-center animate-fade-in-up">
                                    <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-emerald-400 drop-shadow-lg" />
                                    <span className="text-emerald-300 font-bold block text-xl">تم اختيار الصورة بنجاح</span>
                                    <span className="text-sm text-slate-400 mt-2 block">{value.name}</span>
                                </div>
                             )}
                             <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    onChange(question.id, null);
                                }}
                                className="absolute top-4 left-4 bg-red-500/20 hover:bg-red-500/40 text-red-200 p-3 rounded-2xl backdrop-blur-md transition-colors border border-red-500/30 shadow-lg"
                             >
                                <X className="w-6 h-6" />
                             </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 group-hover:text-cyan-400 transition-colors">
                            <div className="p-5 bg-slate-700/50 rounded-full mb-4 group-hover:bg-slate-600/50 group-hover:scale-110 transition-all shadow-inner">
                                <Upload className="w-10 h-10" />
                            </div>
                            <p className="mb-2 text-xl font-bold">اضغط لرفع صورة</p>
                            <p className="text-sm opacity-60">JPG, PNG, GIF</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                onChange(question.id, e.target.files[0]);
                            }
                        }}
                    />
                </label>
            </div>
        );

    default:
      return null;
  }
};
