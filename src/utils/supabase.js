import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// ============================================
// AUTH HELPER FUNCTIONS
// Matches your exact schema
// ============================================

export const authHelpers = {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) console.error('Get user error:', error);
    return { user, error };
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) console.error('Get profile error:', error);
    return { data, error };
  },

  async getUserBusinesses(userId) {
    const { data, error } = await supabase
      .from('user_businesses')
      .select(`*, businesses(*)`)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });
    if (error) console.error('Get businesses error:', error);
    return { data, error };
  },

  // ✅ Create app user only if not exists (use upsert)
  async createAppUser(user) {
    const { id, email, user_metadata } = user;
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id,
          email,
          // full_name: user_metadata?.full_name || 'Unknown', // required column
        },
        { onConflict: 'id' } // conflict on primary key
      )
      .select()
      .single();

    if (error) console.error('Create app user error:', error);
    return { data, error };
  },

  // ✅ Create business, ensure owner_id exists
  async createBusiness(businessData, ownerId) {
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...businessData,
        owner_id: ownerId,
      })
      .select()
      .single();
    if (error) console.error('Create business error:', error);
    return { data, error };
  },

  // ✅ Link user to business
  async linkUserToBusiness(userId, businessId, role = 'owner') {
    const { data, error } = await supabase
      .from('user_businesses')
      .insert([{
        user_id: userId,
        business_id: businessId,
        role,
        is_active: true
      }])
      .select()
      .single();
    if (error) console.error('Link user error:', error);
    return { data, error };
  },

  async setCurrentBusiness(userId, businessId) {
    const { data, error } = await supabase
      .from('users')
      .update({ current_business_id: businessId })
      .eq('id', userId)
      .select()
      .single();
    if (error) console.error('Set current business error:', error);
    return { data, error };
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) console.error('Update profile error:', error);
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = '/login';
    return { error };
  },
};


// ============================================
// BUSINESS HELPER FUNCTIONS
// ============================================

export const businessHelpers = {
  /**
   * Get business settings
   */
  async getBusinessSettings(businessId) {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('business_id', businessId)
      .single();
    
    return { data, error };
  },

  /**
   * Update business settings
   */
  async updateBusinessSettings(businessId, settings) {
    const { data, error } = await supabase
      .from('business_settings')
      .update(settings)
      .eq('business_id', businessId)
      .select()
      .single();
    
    return { data, error };
  },

  /**
   * Get team members for a business
   */
  async getTeamMembers(businessId) {
    const { data, error } = await supabase
      .from('user_businesses')
      .select(`
        *,
        users (
          id,
          email,
          first_name,
          last_name,
          full_name,
          avatar_url,
          phone,
          role
        )
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Update business details
   */
  async updateBusiness(businessId, updates) {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();
    
    return { data, error };
  }
};