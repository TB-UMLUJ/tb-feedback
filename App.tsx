
import React, { useState } from 'react';
import { SurveyResponse } from './types';
import { surveyService } from './services/surveyService';
import { SurveyViewer } from './components/SurveyViewer';
import { AdminDashboard } from './components/AdminDashboard';
import { MAIN_SURVEY } from './services/mockData';

function App() {
  const [view, setView] = useState<'SURVEY' | 'ADMIN'>('SURVEY');

  const handleSubmitResponse = async (response: SurveyResponse) => {
    try {
      await surveyService.submitResponse(response);
    } catch (error: any) {
      console.error("Submission failed:", error);
      // Extract meaningful message if possible
      const msg = error?.message || "حدث خطأ غير متوقع أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.";
      alert(msg);
      // Re-throw if you want the child component to know (though SurveyViewer currently handles its own state transition mostly)
      throw error;
    }
  };

  if (view === 'ADMIN') {
    return <AdminDashboard onBack={() => setView('SURVEY')} />;
  }

  return (
    <div className="min-h-screen bg-[#0b1121] font-sans" dir="rtl">
      <main>
        <SurveyViewer
          survey={MAIN_SURVEY}
          onSubmit={handleSubmitResponse}
          onExit={() => window.location.reload()} 
          onOpenAdmin={() => setView('ADMIN')}
        />
      </main>
    </div>
  );
}

export default App;
