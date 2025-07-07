"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseClient = exports.supabase = void 0;
exports.testConnection = testConnection;
const supabase_js_1 = require("@supabase/supabase-js");
const logger_1 = require("./logger");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    logger_1.logger.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
}
// 서버사이드에서는 Service Key 사용
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// 클라이언트 연결을 위한 anon key 클라이언트
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
    logger_1.logger.error('Missing Supabase anon key');
    throw new Error('Missing Supabase anon key');
}
exports.supabaseClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// 연결 테스트 함수
async function testConnection() {
    try {
        const { data, error } = await exports.supabase
            .from('curriculums')
            .select('count')
            .limit(1);
        if (error) {
            logger_1.logger.error('Supabase connection test failed:', error);
            return false;
        }
        logger_1.logger.info('Supabase connection successful');
        return true;
    }
    catch (error) {
        logger_1.logger.error('Supabase connection test error:', error);
        return false;
    }
}
//# sourceMappingURL=supabase.js.map