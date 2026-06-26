export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'user' | 'admin' | 'super_admin' | 'executive'
export type AdminRole = 'admin' | 'super_admin' | 'executive'
export type AppMode = 'dating' | 'matrimony'
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type ActionType = 'like' | 'pass' | 'superlike' | 'block'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          date_of_birth: string | null
          gender: string | null
          city: string | null
          bio: string | null
          profile_complete: boolean
          is_verified: boolean
          is_banned: boolean
          ban_reason: string | null
          ban_expires_at: string | null
          trust_score: number
          trust_level: string
          role: UserRole
          is_premium: boolean
          premium_expires_at: string | null
          verification_status: VerificationStatus
          email_verification_status: string
          email_verified_at: string | null
          phone_number: string | null
          phone_verification_status: string
          phone_verified_at: string | null
          selfie_verified_at: string | null
          id_card_url: string | null
          id_verification_status: string
          onboarding_step: string | null
          preferred_mode: AppMode | null
          created_at: string
          updated_at: string
        }
        Insert: { id: string } & Partial<Omit<Database['public']['Tables']['users']['Row'], 'id'>>
        Update: Partial<Database['public']['Tables']['users']['Row']>
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          primary_photo_url: string | null
          additional_photos: string[]
          interests: string[]
          religion: string | null
          education: string | null
          occupation: string | null
          height_cm: number | null
          mother_tongue: string | null
          about: string | null
          looking_for: string | null
          created_at: string
          updated_at: string
        }
        Insert: { user_id: string } & Partial<Omit<Database['public']['Tables']['user_profiles']['Row'], 'user_id'>>
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
        Relationships: []
      }
      admin_users: {
        Row: {
          user_id: string
          role: AdminRole
          permissions: Json
          is_active: boolean
          created_at: string
        }
        Insert: { user_id: string; role: AdminRole } & Partial<Omit<Database['public']['Tables']['admin_users']['Row'], 'user_id' | 'role'>>
        Update: Partial<Database['public']['Tables']['admin_users']['Row']>
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: { user1_id: string; user2_id: string } & Partial<Omit<Database['public']['Tables']['matches']['Row'], 'user1_id' | 'user2_id'>>
        Update: Partial<Database['public']['Tables']['matches']['Row']>
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          media_url: string | null
          read_at: string | null
          created_at: string
        }
        Insert: { match_id: string; sender_id: string; content: string } & Partial<Omit<Database['public']['Tables']['messages']['Row'], 'match_id' | 'sender_id' | 'content'>>
        Update: Partial<Database['public']['Tables']['messages']['Row']>
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          caption: string | null
          media_url: string | null
          media_type: string | null
          is_active: boolean
          reaction_count: number
          created_at: string
        }
        Insert: { user_id: string } & Partial<Omit<Database['public']['Tables']['posts']['Row'], 'user_id'>>
        Update: Partial<Database['public']['Tables']['posts']['Row']>
        Relationships: []
      }
      tribes: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          cover_image_url: string | null
          member_count: number
          created_by: string | null
          is_active: boolean
          created_at: string
        }
        Insert: { name: string } & Partial<Omit<Database['public']['Tables']['tribes']['Row'], 'name'>>
        Update: Partial<Database['public']['Tables']['tribes']['Row']>
        Relationships: []
      }
      user_tribes: {
        Row: {
          id: string
          user_id: string
          tribe_id: string
          joined_at: string
        }
        Insert: { user_id: string; tribe_id: string } & Partial<Omit<Database['public']['Tables']['user_tribes']['Row'], 'user_id' | 'tribe_id'>>
        Update: Partial<Database['public']['Tables']['user_tribes']['Row']>
        Relationships: []
      }
      suyamvaram_challenges: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string | null
          challenge_type: string | null
          deadline: string | null
          max_participants: number | null
          application_count: number
          is_active: boolean
          created_at: string
        }
        Insert: { created_by: string; title: string } & Partial<Omit<Database['public']['Tables']['suyamvaram_challenges']['Row'], 'created_by' | 'title'>>
        Update: Partial<Database['public']['Tables']['suyamvaram_challenges']['Row']>
        Relationships: []
      }
      suyamvaram_applications: {
        Row: {
          id: string
          challenge_id: string
          applicant_id: string
          status: string
          message: string | null
          created_at: string
        }
        Insert: { challenge_id: string; applicant_id: string } & Partial<Omit<Database['public']['Tables']['suyamvaram_applications']['Row'], 'challenge_id' | 'applicant_id'>>
        Update: Partial<Database['public']['Tables']['suyamvaram_applications']['Row']>
        Relationships: []
      }
      user_actions: {
        Row: {
          id: string
          actor_user_id: string
          target_user_id: string
          action_type: ActionType
          created_at: string
        }
        Insert: { actor_user_id: string; target_user_id: string; action_type: ActionType } & Partial<Omit<Database['public']['Tables']['user_actions']['Row'], 'actor_user_id' | 'target_user_id' | 'action_type'>>
        Update: Partial<Database['public']['Tables']['user_actions']['Row']>
        Relationships: []
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          status: VerificationStatus
          request_type: string
          selfie_url: string | null
          media_url: string | null
          id_card_url: string | null
          phone_number: string | null
          metadata: Json
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: { user_id: string; request_type: string } & Partial<Omit<Database['public']['Tables']['verification_requests']['Row'], 'user_id' | 'request_type'>>
        Update: Partial<Database['public']['Tables']['verification_requests']['Row']>
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string
          category: string | null
          description: string | null
          severity: string | null
          status: string
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: { reporter_id: string; reported_user_id: string } & Partial<Omit<Database['public']['Tables']['reports']['Row'], 'reporter_id' | 'reported_user_id'>>
        Update: Partial<Database['public']['Tables']['reports']['Row']>
        Relationships: []
      }
      user_feedback: {
        Row: {
          id: string
          user_id: string
          message: string
          type: string | null
          status: string
          closed_by: string | null
          closed_note: string | null
          closed_at: string | null
          created_at: string
        }
        Insert: { user_id: string; message: string } & Partial<Omit<Database['public']['Tables']['user_feedback']['Row'], 'user_id' | 'message'>>
        Update: Partial<Database['public']['Tables']['user_feedback']['Row']>
        Relationships: []
      }
      deepfake_scans: {
        Row: {
          id: string
          user_id: string
          media_url: string
          scan_result: string | null
          confidence_score: number | null
          is_deepfake: boolean
          flagged_at: string | null
          created_at: string
        }
        Insert: { user_id: string; media_url: string } & Partial<Omit<Database['public']['Tables']['deepfake_scans']['Row'], 'user_id' | 'media_url'>>
        Update: Partial<Database['public']['Tables']['deepfake_scans']['Row']>
        Relationships: []
      }
      content_auto_removals: {
        Row: {
          id: string
          user_id: string
          content_type: string
          content_id: string | null
          reason: string | null
          removed_at: string
          created_at: string
        }
        Insert: { user_id: string; content_type: string; removed_at: string } & Partial<Omit<Database['public']['Tables']['content_auto_removals']['Row'], 'user_id' | 'content_type' | 'removed_at'>>
        Update: Partial<Database['public']['Tables']['content_auto_removals']['Row']>
        Relationships: []
      }
      admin_activity_log: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string | null
          target_id: string | null
          details: Json
          created_at: string
        }
        Insert: { admin_id: string; action: string } & Partial<Omit<Database['public']['Tables']['admin_activity_log']['Row'], 'admin_id' | 'action'>>
        Update: Partial<Database['public']['Tables']['admin_activity_log']['Row']>
        Relationships: []
      }
      notification_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string | null
          created_at: string
        }
        Insert: { user_id: string; token: string } & Partial<Omit<Database['public']['Tables']['notification_tokens']['Row'], 'user_id' | 'token'>>
        Update: Partial<Database['public']['Tables']['notification_tokens']['Row']>
        Relationships: []
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: string
          created_at: string
        }
        Insert: { post_id: string; user_id: string; reaction_type: string } & Partial<Omit<Database['public']['Tables']['post_reactions']['Row'], 'post_id' | 'user_id' | 'reaction_type'>>
        Update: Partial<Database['public']['Tables']['post_reactions']['Row']>
        Relationships: []
      }
      user_blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: { blocker_id: string; blocked_id: string } & Partial<Omit<Database['public']['Tables']['user_blocks']['Row'], 'blocker_id' | 'blocked_id'>>
        Update: Partial<Database['public']['Tables']['user_blocks']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_privileged_user: { Args: Record<string, never>; Returns: boolean }
      increment_tribe_member_count: { Args: { tid: string }; Returns: void }
    }
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
