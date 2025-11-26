
import { Survey, QuestionType, SurveyResponse } from '../types';

export const MAIN_SURVEY: Survey = {
  id: 'maintenance_request_fixed',
  title: 'بلاغ صيانة',
  description: 'نظام البلاغات',
  createdAt: new Date().toISOString(),
  active: true,
  theme: {
    primaryColor: '#22d3ee', // Cyan-400
    font: 'El Messiri'
  },
  notifications: {
    enabled: true,
    recipients: 'telegram',
    notifyOnCritical: true
  },
  questions: [
    {
      id: 'name',
      type: QuestionType.SHORT_TEXT,
      text: 'اسمك :',
      required: true
    },
    {
      id: 'category',
      type: QuestionType.SINGLE_CHOICE,
      text: 'فئة مقدم البلاغ :',
      options: ['موظف', 'مراجع / زائر'],
      required: true
    },
    {
      id: 'location',
      type: QuestionType.SHORT_TEXT,
      text: 'القسم أو الموقع الذي تمت فيه الملاحظة :',
      description: '',
      required: true
    },
    {
      id: 'details',
      type: QuestionType.LONG_TEXT,
      text: 'تفاصيل البلاغ :',
      description: '',
      required: true
    },
    {
      id: 'image',
      type: QuestionType.IMAGE,
      text: 'أرسل لنا صورة للبلاغ :',
      description: '(اختياري)',
      required: false
    }
  ]
};

// Dummy data for Admin Dashboard preview
export const INITIAL_RESPONSES: SurveyResponse[] = [
  {
    id: '8507294',
    surveyId: 'maintenance_request_fixed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    answers: {
      name: 'أحمد محمد',
      category: 'موظف',
      location: 'قسم الطوارئ - الغرفة 3',
      details: 'تسريب مياه من المكيف العلوي يسبب تجمع مياه على الأرض.',
      image: 'https://images.unsplash.com/photo-1581094794329-cd811c2e6d8d?q=80&w=600&auto=format&fit=crop'
    }
  },
  {
    id: '9211051',
    surveyId: 'maintenance_request_fixed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    answers: {
      name: 'خالد العنزي',
      category: 'مراجع / زائر',
      location: 'مواقف السيارات الجنوبية',
      details: 'الإضاءة في الممر المؤدي للمدخل الرئيسي لا تعمل.',
      image: null
    }
  }
];
