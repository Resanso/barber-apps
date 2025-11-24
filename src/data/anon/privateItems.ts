'use server';
import { createSupabaseClient } from '@/supabase-clients/server';
import { Table } from '@/types';
export const getUserPrivateItems = async (): Promise<
  Array<Table<'private_items'>>
> => {
  const supabase = await createSupabaseClient();
  try {
    const { data, error } = await supabase.from('private_items').select('*');

    if (error) {
      // Suppress noisy prerender fetch rejections (Next prerender finalization).
      const message = (error as any)?.message ?? '';
      if (
        typeof message === 'string' &&
        message.includes(
          'During prerendering, fetch() rejects when the prerender is complete'
        )
      ) {
        // return empty without noisy logging
        return [];
      }

      // Log full Supabase error on the server for debugging
      console.error(
        'getUserPrivateItems supabase error:',
        JSON.stringify(error)
      );
      // Return empty list to avoid crashing RSC stream — we'll investigate from logs
      return [];
    }

    return data ?? [];
  } catch (err) {
    // If this is the prerender-complete fetch rejection, swallow it silently
    const msg = (err as any)?.message ?? '';
    if (
      typeof msg === 'string' &&
      msg.includes(
        'During prerendering, fetch() rejects when the prerender is complete'
      )
    ) {
      return [];
    }

    // Otherwise log and return empty list
    console.error('getUserPrivateItems unexpected error:', err);
    return [];
  }
};

export const getPrivateItem = async (
  id: string
): Promise<Table<'private_items'>> => {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('private_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};
