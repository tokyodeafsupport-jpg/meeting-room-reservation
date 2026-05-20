export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          organization: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          organization: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          organization?: string;
          color?: string;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          floor: number;
          has_restriction: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          floor: number;
          has_restriction?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          floor?: number;
          has_restriction?: boolean;
        };
      };
      reservations: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          purpose: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          purpose: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          purpose?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type ReservationInsert = Database["public"]["Tables"]["reservations"]["Insert"];
export type ReservationUpdate = Database["public"]["Tables"]["reservations"]["Update"];
export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
