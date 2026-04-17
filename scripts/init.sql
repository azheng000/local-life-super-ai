-- 陵水本地生活智能体 数据库初始化脚本
-- PostgreSQL + PostGIS

-- 启用PostGIS扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- 商家智能体主表
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    agent_type VARCHAR(20) DEFAULT 'merchant',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);

-- ============================================
-- 商家基础信息表
-- ============================================
CREATE TABLE IF NOT EXISTS agent_basic_info (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    contact VARCHAR(50),
    owner_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_basic_category ON agent_basic_info(category);
CREATE INDEX IF NOT EXISTS idx_basic_location ON agent_basic_info USING GIST(location);

-- ============================================
-- 商家品牌信息表（解决AI无人情味痛点）
-- ============================================
CREATE TABLE IF NOT EXISTS agent_brand_info (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
    story TEXT,
    personality VARCHAR(50) DEFAULT 'warm_and_friendly',
    keywords TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 商家服务信息表
-- ============================================
CREATE TABLE IF NOT EXISTS agent_service_info (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
    services JSONB DEFAULT '[]',
    price_range NUMERIC[],
    business_hours VARCHAR(100) DEFAULT '09:00-21:00',
    special_tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 信任分表（解决推荐不透明痛点）
-- ============================================
CREATE TABLE IF NOT EXISTS agent_trust_scores (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
    quality_score NUMERIC DEFAULT 50,
    activity_score NUMERIC DEFAULT 100,
    warmth_score NUMERIC DEFAULT 50,
    total_score NUMERIC DEFAULT 65,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MCP配置表
-- ============================================
CREATE TABLE IF NOT EXISTS agent_mcp_config (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
    endpoint VARCHAR(255),
    tools JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 预约/订单表（抖音核销率核心）
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    reservation_id VARCHAR(50) UNIQUE NOT NULL,
    agent_id VARCHAR(50) REFERENCES agents(agent_id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(10),
    party_size INTEGER DEFAULT 1,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    source VARCHAR(30) DEFAULT 'direct',
    verification_code VARCHAR(10),
    merchant_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_reservations_agent ON reservations(agent_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(customer_phone);

-- ============================================
-- 对话日志表
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    agent_id VARCHAR(50),
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversation_logs(agent_id);

-- ============================================
-- 通知记录表（微信模板消息推送追踪）
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    notification_id VARCHAR(50) UNIQUE NOT NULL,
    reservation_id VARCHAR(50) REFERENCES reservations(reservation_id) ON DELETE SET NULL,
    agent_id VARCHAR(50) REFERENCES agents(agent_id) ON DELETE SET NULL,
    notification_type VARCHAR(30) NOT NULL,
    channel VARCHAR(20) DEFAULT 'wechat',
    recipient VARCHAR(50),
    content JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_notifications_agent ON notifications(agent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ============================================
-- 更新触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新触发器
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_basic_info_updated_at ON agent_basic_info;
CREATE TRIGGER update_basic_info_updated_at BEFORE UPDATE ON agent_basic_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_info_updated_at ON agent_brand_info;
CREATE TRIGGER update_brand_info_updated_at BEFORE UPDATE ON agent_brand_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_info_updated_at ON agent_service_info;
CREATE TRIGGER update_service_info_updated_at BEFORE UPDATE ON agent_service_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trust_scores_updated_at ON agent_trust_scores;
CREATE TRIGGER update_trust_scores_updated_at BEFORE UPDATE ON agent_trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mcp_config_updated_at ON agent_mcp_config;
CREATE TRIGGER update_mcp_config_updated_at BEFORE UPDATE ON agent_mcp_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 信任分自动更新函数
-- ============================================
CREATE OR REPLACE FUNCTION update_total_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    -- 综合分 = 质量分×0.4 + 活跃分×0.3 + 人情分×0.3
    NEW.total_score = (NEW.quality_score * 0.4 + NEW.activity_score * 0.3 + NEW.warmth_score * 0.3);
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_total_score ON agent_trust_scores;
CREATE TRIGGER update_total_score BEFORE UPDATE OR INSERT ON agent_trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_total_trust_score();

-- ============================================
-- 初始化默认数据（可选）
-- ============================================
-- INSERT INTO agents (agent_id, agent_type, status) VALUES ('AGT_demo_001', 'merchant', 'active');
