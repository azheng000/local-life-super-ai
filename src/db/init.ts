import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lingshui_local_life';

async function initDatabase() {
  console.log('🔄 开始初始化数据库...');
  
  // 首先连接到默认postgres数据库来创建我们的数据库
  const adminPool = new Pool({
    connectionString: DATABASE_URL.replace('/lingshui_local_life', '/postgres'),
  });

  try {
    // 检查数据库是否存在
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'lingshui_local_life'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('📦 创建数据库 lingshui_local_life...');
      await adminPool.query('CREATE DATABASE lingshui_local_life');
      console.log('✅ 数据库创建成功');
    } else {
      console.log('ℹ️ 数据库已存在，跳过创建');
    }
  } finally {
    await adminPool.end();
  }

  // 连接到目标数据库执行建表
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // 启用PostGIS扩展（用于地理位置查询）
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS扩展已启用');

    // 1. 商家智能体主表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(50) UNIQUE NOT NULL,
        agent_type VARCHAR(20) DEFAULT 'merchant',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ 表 agents 已创建');

    // 2. 商家基础信息表
    await pool.query(`
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
    `);
    console.log('✅ 表 agent_basic_info 已创建');

    // 3. 商家品牌信息表（解决AI无人情味痛点）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_brand_info (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
        story TEXT,
        personality VARCHAR(50) DEFAULT 'warm_and_friendly',
        keywords TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ 表 agent_brand_info 已创建');

    // 4. 商家服务信息表
    await pool.query(`
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
    `);
    console.log('✅ 表 agent_service_info 已创建');

    // 5. 信任分表（解决推荐不透明痛点）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_trust_scores (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
        quality_score NUMERIC DEFAULT 50,
        activity_score NUMERIC DEFAULT 100,
        warmth_score NUMERIC DEFAULT 50,
        total_score NUMERIC DEFAULT 65,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ 表 agent_trust_scores 已创建');

    // 6. MCP配置表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_mcp_config (
        id SERIAL PRIMARY KEY,
        agent_id VARCHAR(50) UNIQUE REFERENCES agents(agent_id) ON DELETE CASCADE,
        endpoint VARCHAR(255),
        tools JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ 表 agent_mcp_config 已创建');

    // 7. 预约/订单表（🔥抖音核销率核心）
    await pool.query(`
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
    `);
    console.log('✅ 表 reservations 已创建');

    // 8. 对话日志表
    await pool.query(`
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
    `);
    console.log('✅ 表 conversation_logs 已创建');

    // 9. 通知记录表（微信模板消息推送追踪）
    await pool.query(`
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
    `);
    console.log('✅ 表 notifications 已创建');

    // 创建索引
    console.log('\n🔧 创建索引...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);');
    console.log('✅ agents 表索引已创建');

    await pool.query('CREATE INDEX IF NOT EXISTS idx_basic_category ON agent_basic_info(category);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_basic_location ON agent_basic_info USING GIST(location);');
    console.log('✅ agent_basic_info 表索引已创建');

    await pool.query('CREATE INDEX IF NOT EXISTS idx_reservations_agent ON reservations(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(customer_phone);');
    console.log('✅ reservations 表索引已创建');

    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversation_logs(session_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversation_logs(agent_id);');
    console.log('✅ conversation_logs 表索引已创建');

    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_agent ON notifications(agent_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);');
    console.log('✅ notifications 表索引已创建');

    console.log('\n🎉 数据库初始化完成！');

    // 插入示例数据
    await insertSampleData(pool);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function insertSampleData(pool: pg.Pool) {
  console.log('\n📝 插入示例数据...');

  // 检查是否已有数据
  const existingAgent = await pool.query('SELECT COUNT(*) FROM agents');
  if (parseInt(existingAgent.rows[0].count) > 0) {
    console.log('ℹ️ 示例数据已存在，跳过插入');
    return;
  }

  // 示例商家1：陵水海鲜店
  const agentId1 = 'AGT_demo_001';
  await pool.query(`
    INSERT INTO agents (agent_id, agent_type, status) VALUES ($1, 'merchant', 'active')
  `, [agentId1]);

  await pool.query(`
    INSERT INTO agent_basic_info (agent_id, name, category, address, lat, lng, contact, owner_name)
    VALUES ($1, '陵水海鲜坊', '餐饮', '海南省陵水县椰林镇和平路38号', 18.5494, 110.0347, '0898-83318888', '陈老板')
  `, [agentId1]);

  await pool.query(`
    INSERT INTO agent_brand_info (agent_id, story, personality, keywords)
    VALUES ($1, '开了20年的老店，海鲜都是当天从清水湾捕捞上来的，陈老板说：做人要实在，做海鲜更要实在！', '实在热情', ARRAY['新鲜', '老字号', '实在'])
  `, [agentId1]);

  await pool.query(`
    INSERT INTO agent_service_info (agent_id, services, price_range, business_hours, special_tags)
    VALUES ($1, $2, ARRAY[80, 200], '10:00-22:00', ARRAY['海鲜', '包厢', '停车位'])
  `, [agentId1, JSON.stringify([
    { name: '清蒸石斑鱼', price: 168, description: '当天新鲜石斑，清蒸最能保留鲜味' },
    { name: '蒜蓉粉丝蒸扇贝', price: 38, description: '每桌必点，蒜香四溢' },
    { name: '椒盐皮皮虾', price: 88, description: '外酥里嫩，下酒神器' },
    { name: '椰子炖文昌鸡', price: 128, description: '本地特色，椰香浓郁' }
  ])]);

  await pool.query(`
    INSERT INTO agent_trust_scores (agent_id, quality_score, activity_score, warmth_score, total_score)
    VALUES ($1, 92, 95, 90, 91)
  `, [agentId1]);

  await pool.query(`
    INSERT INTO agent_mcp_config (agent_id, endpoint, tools)
    VALUES ($1, $2, $3)
  `, [agentId1, `http://localhost:3000/mcp/${agentId1}`, JSON.stringify([
    { name: 'get_business_info', description: '获取商家基本信息', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_menu', description: '获取菜单或服务项目列表', inputSchema: { type: 'object', properties: { category: { type: 'string' } } } },
    { name: 'check_availability', description: '查询预约可用时间', inputSchema: { type: 'object', properties: { date: { type: 'string' }, party_size: { type: 'number' } }, required: ['date'] } },
    { name: 'make_reservation', description: '预约服务', inputSchema: { type: 'object', properties: { customer_name: { type: 'string' }, customer_phone: { type: 'string' }, date: { type: 'string' }, time: { type: 'string' }, party_size: { type: 'number' }, notes: { type: 'string' } }, required: ['customer_name', 'customer_phone', 'date'] } },
    { name: 'get_story', description: '获取商家故事和品牌特色', inputSchema: { type: 'object', properties: {} } }
  ])]);

  // 示例商家2：分界洲岛民宿
  const agentId2 = 'AGT_demo_002';
  await pool.query(`
    INSERT INTO agents (agent_id, agent_type, status) VALUES ($1, 'merchant', 'active')
  `, [agentId2]);

  await pool.query(`
    INSERT INTO agent_basic_info (agent_id, name, category, address, lat, lng, contact, owner_name)
    VALUES ($1, '分界洲海景民宿', '酒店', '海南省陵水县分界洲岛景区内', 18.5818, 110.0939, '0898-83396666', '林老板娘')
  `, [agentId2]);

  await pool.query(`
    INSERT INTO agent_brand_info (agent_id, story, personality, keywords)
    VALUES ($1, '从广州来陵水度假就爱上了分界洲岛，一冲动就开了这家民宿。林老板娘说：希望能让你在这里找到家的感觉。', '温柔贴心', ARRAY['海景', '浪漫', '治愈'])
  `, [agentId2]);

  await pool.query(`
    INSERT INTO agent_service_info (agent_id, services, price_range, business_hours, special_tags)
    VALUES ($1, $2, ARRAY[299, 899], '24小时入住', ARRAY['海景房', '接机服务', '早餐'])
  `, [agentId2, JSON.stringify([
    { name: '海景标准间', price: 399, description: '面朝大海，落地窗可观日出' },
    { name: '海景大床房', price: 599, description: '1.8米大床，阳台赏月' },
    { name: '亲子海景套房', price: 899, description: '带小朋友的首选，有儿童帐篷' }
  ])]);

  await pool.query(`
    INSERT INTO agent_trust_scores (agent_id, quality_score, activity_score, warmth_score, total_score)
    VALUES ($1, 95, 88, 98, 94)
  `, [agentId2]);

  await pool.query(`
    INSERT INTO agent_mcp_config (agent_id, endpoint, tools)
    VALUES ($1, $2, $3)
  `, [agentId2, `http://localhost:3000/mcp/${agentId2}`, JSON.stringify([
    { name: 'get_business_info', description: '获取商家基本信息', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_menu', description: '获取房型列表', inputSchema: { type: 'object', properties: {} } },
    { name: 'check_availability', description: '查询预订可用日期', inputSchema: { type: 'object', properties: { date: { type: 'string' } }, required: ['date'] } },
    { name: 'make_reservation', description: '预订房间', inputSchema: { type: 'object', properties: { customer_name: { type: 'string' }, customer_phone: { type: 'string' }, date: { type: 'string' }, notes: { type: 'string' } }, required: ['customer_name', 'customer_phone', 'date'] } },
    { name: 'get_story', description: '获取民宿故事', inputSchema: { type: 'object', properties: {} } }
  ])]);

  console.log('✅ 示例数据插入完成');
}

initDatabase().catch(console.error);
