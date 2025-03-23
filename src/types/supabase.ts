
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          avatar_url: string | null
          department: string | null
          employee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          avatar_url?: string | null
          department?: string | null
          employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          department?: string | null
          employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      face_data: {
        Row: {
          id: string
          user_id: string
          descriptors: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          descriptors: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          descriptors?: Json
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          date: string
          time_in: string
          time_out: string | null
          status: "present" | "absent" | "late"
          location: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          time_in: string
          time_out?: string | null
          status: "present" | "absent" | "late"
          location: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          time_in?: string
          time_out?: string | null
          status?: "present" | "absent" | "late"
          location?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
