export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const supabaseClient: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export type Database = {
    public: {
        Tables: {
            curriculums: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    target_audience: string | null;
                    duration: string | null;
                    type: string | null;
                    content: any;
                    metadata: any | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    target_audience?: string | null;
                    duration?: string | null;
                    type?: string | null;
                    content: any;
                    metadata?: any | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    target_audience?: string | null;
                    duration?: string | null;
                    type?: string | null;
                    content?: any;
                    metadata?: any | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            chat_histories: {
                Row: {
                    id: string;
                    curriculum_id: string;
                    role: string;
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    curriculum_id: string;
                    role: string;
                    content: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    curriculum_id?: string;
                    role?: string;
                    content?: string;
                    created_at?: string;
                };
            };
            curriculum_versions: {
                Row: {
                    id: string;
                    curriculum_id: string;
                    version_number: number;
                    content: any;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    curriculum_id: string;
                    version_number: number;
                    content: any;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    curriculum_id?: string;
                    version_number?: number;
                    content?: any;
                    created_at?: string;
                };
            };
        };
    };
};
export declare function testConnection(): Promise<boolean>;
//# sourceMappingURL=supabase.d.ts.map