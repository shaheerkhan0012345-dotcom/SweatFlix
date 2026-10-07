import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FeedbackSubmission {
  id?: string;
  user_id?: string;
  rating: number;
  category: string;
  message: string;
  created_at?: string;
}

export const feedbackService = {
  async submitFeedback(
    userId: string | null,
    rating: number,
    category: string,
    message: string
  ): Promise<void> {
    const trimmed = message.trim();

    // 1. Always record locally as fallback
    try {
      const stored = await AsyncStorage.getItem('@sweatflix_feedback_entries');
      const list = stored ? JSON.parse(stored) : [];
      list.push({
        id: Date.now().toString(),
        userId,
        rating,
        category,
        message: trimmed,
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('@sweatflix_feedback_entries', JSON.stringify(list));
    } catch (e) {
      console.warn('Local feedback save error:', e);
    }

    // 2. Submit to Supabase if configured and user is logged in
    if (isSupabaseConfigured && userId) {
      try {
        const { error } = await supabase.from('feedback').insert({
          user_id: userId,
          rating,
          category,
          message: trimmed,
        });

        if (error) {
          console.warn('Supabase feedback insert error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase feedback insert exception:', err?.message);
      }
    }
  },
};
