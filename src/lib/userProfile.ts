import { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { normalizeUsername } from '@/lib/usernameAuth';

export const ensureUserProfile = async (user: User | null) => {
  if (!user) return false;

  const emailPrefix = user.email?.split('@')[0] ?? null;
  const fallbackUsername = emailPrefix ? normalizeUsername(emailPrefix) : null;

  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email ?? '',
    full_name: (user as any)?.user_metadata?.full_name ?? null,
    username: (user as any)?.user_metadata?.username ?? fallbackUsername,
  });

  if (error) {
    console.error('Error syncing user profile:', error);
    return false;
  }

  return true;
};
