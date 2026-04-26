import { supabase } from './supabase/client';
import { Profile, UserRole } from '@/types/auth';

export const signUpUser = async (
  email: string, 
  password: string, 
  fullName: string, 
  role: UserRole, 
  department?: string
) => {
  if (!supabase) return { error: { message: 'Supabase is not configured' } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { error };
  if (!data.user) return { error: { message: 'Kullanıcı oluşturulamadı.' } };

  // Create the profile entry
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      full_name: fullName,
      email,
      role,
      department: department || null,
    });

  if (profileError) {
    console.error('Profile insertion failed:', {
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code
    });
    return { 
      error: { 
        message: 'Kullanıcı oluşturuldu ancak profil bilgisi kaydedilemedi. Lütfen tekrar deneyin.',
        originalError: profileError 
      } 
    };
  }

  return { data };
};

export const signInUser = async (email: string, password: string) => {
  if (!supabase) return { error: { message: 'Supabase is not configured' } };
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOutUser = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentProfile = async (): Promise<Profile | null> => {
  if (!supabase) return null;
  
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data as Profile;
};
