
import { Survey, SurveyResponse, ReportStatus } from '../types';
import { MAIN_SURVEY, INITIAL_RESPONSES } from './mockData';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vjhayanayvozjzxhvllb.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaGF5YW5heXZvemp6eGh2bGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjEyMzAsImV4cCI6MjA3OTczNzIzMH0.qivgOyl3Hz5Rw0KhT6ZKr3RDa3467s0gkLMRwMtx4fQ';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Helper to map DB row to SurveyResponse object
export const mapRowToResponse = (row: any): SurveyResponse => {
  return {
    id: row.report_id,
    surveyId: MAIN_SURVEY.id,
    timestamp: row.created_at,
    // ERP Fields
    status: (row.status as ReportStatus) || 'new',
    priority: row.priority || 'normal',
    internal_notes: row.internal_notes || '',
    answers: {
      name: row.name,
      category: row.category,
      location: row.location,
      details: row.details,
      image: row.image_url
    }
  };
};

export const surveyService = {
  getSurveys: (): Survey[] => {
    return [MAIN_SURVEY];
  },

  fetchResponses: async (): Promise<SurveyResponse[]> => {
    if (!supabase) {
      console.warn('Supabase not configured. Returning mock data.');
      return INITIAL_RESPONSES;
    }

    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching responses:', JSON.stringify(error));
      return [];
    }

    return data.map(mapRowToResponse);
  },

  submitResponse: async (response: SurveyResponse): Promise<void> => {
    if (!supabase) {
      console.warn('Supabase not configured. Using mock submission.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    const answers = response.answers;
    let imageUrl = null;

    try {
      const imageFile = answers['image'];
      
      if (imageFile && imageFile instanceof File) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${response.id}_${Date.now()}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('maintenance-photos')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          console.error('Error uploading image:', JSON.stringify(uploadError));
        } else if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('maintenance-photos')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      }

      const payload = { 
        report_id: String(response.id),
        name: String(answers['name'] || ''),
        category: String(answers['category'] || ''),
        location: String(answers['location'] || ''),
        details: String(answers['details'] || ''),
        image_url: imageUrl,
        status: 'new', // Default status
        priority: 'normal'
      };

      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert([payload]);

      if (insertError) {
        const errorMsg = JSON.stringify(insertError, null, 2);
        console.error('Supabase Insert Error:', errorMsg);
        throw new Error(`فشل حفظ البيانات: ${insertError.message || errorMsg}`);
      }
    } catch (e: any) {
      console.error('Submit Exception:', e);
      throw e;
    }
  },

  // --- New ERP Functions ---

  updateResponseStatus: async (reportId: string, status: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('maintenance_requests')
      .update({ status })
      .eq('report_id', reportId);
    if (error) console.error('Status Update Error', error);
  },

  updateResponseNotes: async (reportId: string, notes: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('maintenance_requests')
      .update({ internal_notes: notes })
      .eq('report_id', reportId);
    if (error) console.error('Notes Update Error', error);
  },

  deleteResponse: async (reportId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('maintenance_requests')
      .delete()
      .eq('report_id', reportId);
      
    if (error) {
        console.error('Delete Error', error);
        throw error;
    }
  },

  exportToCSV: (responses: SurveyResponse[]) => {
    const headers = ['Report ID', 'Status', 'Date', 'Name', 'Category', 'Location', 'Details', 'Notes', 'Image Link'];
    const rows = responses.map(r => [
      `${r.id}#`,
      r.status || 'new',
      new Date(r.timestamp).toLocaleDateString('ar-SA'),
      r.answers['name'],
      r.answers['category'],
      r.answers['location'],
      `"${String(r.answers['details']).replace(/"/g, '""')}"`, // Escape quotes
      `"${String(r.internal_notes || '').replace(/"/g, '""')}"`,
      r.answers['image'] || ''
    ]);

    const csvContent = "\uFEFF" + // BOM for Arabic support
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maintenance_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
