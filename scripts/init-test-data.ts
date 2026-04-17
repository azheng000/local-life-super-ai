/**
 * 陵水本地生活智能体 - 测试数据初始化脚本
 * 用于向数据库插入测试商家数据
 */

import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 测试商家数据
const testAgents = [
  {
    name: '疍家鱼排海鲜坊',
    category: '美食',
    address: '陵水县新村镇疍家鱼排区',
    contact: '0898-83345678',
    owner_name: '陈老板',
    story: '传承三代的疍家海鲜烹饪技艺，新鲜海鲜现捞现做。',
    personality: 'warm_and_friendly',
    keywords: ['海鲜', '疍家', '水上餐厅', '本地特色'],
    services: [
      { name: '海鲜套餐A', price: 168, description: '含龙虾、石斑鱼等6种海鲜' },
      { name: '海鲜套餐B', price: 98, description: '适合2-3人' },
      { name: '散点海鲜', price: 0, description: '按斤计价，现捞现做' },
    ],
    business_hours: '10:30-21:00',
    special_tags: ['海鲜', '本地特色', '水上餐厅'],
    price_range: [80, 200],
  },
  {
    name: '香水湾君澜度假酒店',
    category: '住宿',
    address: '陵水县香水湾香水大道1号',
    contact: '0898-83567888',
    owner_name: '张经理',
    story: '超五星级海景度假酒店，私人沙滩，无边际泳池。',
    personality: 'professional',
    keywords: ['海景', '度假', '亲子', '高端'],
    services: [
      { name: '豪华海景房', price: 1200, description: '含双早' },
      { name: '家庭套房', price: 2200, description: '可住4人' },
      { name: '蜜月别墅', price: 3000, description: '含私人泳池' },
    ],
    business_hours: '24小时',
    special_tags: ['海景', '度假', '亲子'],
    price_range: [1200, 3000],
  },
  {
    name: '分界洲岛风景区',
    category: '景点',
    address: '陵水县牛岭分界洲岛',
    contact: '0898-83341234',
    owner_name: '景区管理处',
    story: '国家5A级景区，海水清澈见底，是潜水爱好者的天堂。',
    personality: 'enthusiastic',
    keywords: ['海岛', '潜水', '观光', '5A景区'],
    services: [
      { name: '上岛门票', price: 128, description: '含往返船票' },
      { name: '潜水体验', price: 380, description: '30分钟专业潜水' },
      { name: '海豚表演', price: 80, description: '观看海豚互动' },
    ],
    business_hours: '08:30-17:30',
    special_tags: ['海岛', '潜水', '观光'],
    price_range: [80, 500],
  },
  {
    name: '清水湾高尔夫球会',
    category: '运动',
    address: '陵水县清水湾旅游度假区',
    contact: '0898-83355666',
    owner_name: '李总监',
    story: '国际标准18洞海景高尔夫球场，环境优美，设施完备。',
    personality: 'professional',
    keywords: ['高尔夫', '休闲', '会员制'],
    services: [
      { name: '平日18洞', price: 680, description: '周一至周五' },
      { name: '假日18洞', price: 980, description: '周末及节假日' },
      { name: '练习场', price: 150, description: '1小时练习' },
    ],
    business_hours: '06:30-18:30',
    special_tags: ['高尔夫', '休闲', '会员制'],
    price_range: [680, 1000],
  },
  {
    name: '陵水动车站接驳服务',
    category: '出行',
    address: '陵水动车站',
    contact: '138-7654-3210',
    owner_name: '王师傅',
    story: '提供陵水动车站到各大景区、酒店的接送服务。',
    personality: 'warm_and_friendly',
    keywords: ['接送', '包车', '拼车'],
    services: [
      { name: '拼车-市区', price: 50, description: '动车站到陵水县城' },
      { name: '专车-香水湾', price: 120, description: '到香水湾酒店' },
      { name: '包车一日游', price: 600, description: '8小时包车' },
    ],
    business_hours: '24小时',
    special_tags: ['接送', '包车', '拼车'],
    price_range: [50, 600],
  },
  {
    name: '南湾猴岛',
    category: '景点',
    address: '陵水县新村镇南湾半岛',
    contact: '0898-83346789',
    owner_name: '景区管理处',
    story: '我国唯一的岛屿型猕猴自然保护区。',
    personality: 'friendly',
    keywords: ['亲子', '生态', '猕猴'],
    services: [
      { name: '门票+缆车', price: 160, description: '含往返缆车' },
      { name: '观光车票', price: 30, description: '景区内往返' },
      { name: '猴食包', price: 20, description: '与猕猴互动' },
    ],
    business_hours: '08:30-17:30',
    special_tags: ['亲子', '生态', '猕猴'],
    price_range: [150, 200],
  },
];

async function initTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 开始初始化测试数据...\n');
    
    for (const agent of testAgents) {
      await client.query('BEGIN');
      
      try {
        // 生成智能体ID
        const agentId = `AGT_TEST_${Date.now()}_${uuidv4().slice(0, 6).toUpperCase()}`;
        
        // 插入主记录
        await client.query(
          `INSERT INTO agents (agent_id, agent_type, status, created_at)
           VALUES ($1, 'merchant', 'active', NOW())
           ON CONFLICT (agent_id) DO NOTHING`,
          [agentId]
        );
        
        // 插入基础信息
        await client.query(
          `INSERT INTO agent_basic_info 
           (agent_id, name, category, address, contact, owner_name)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (agent_id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           address = EXCLUDED.address`,
          [agentId, agent.name, agent.category, agent.address, agent.contact, agent.owner_name]
        );
        
        // 插入品牌信息
        await client.query(
          `INSERT INTO agent_brand_info 
           (agent_id, story, personality, keywords)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (agent_id) DO UPDATE SET
           story = EXCLUDED.story,
           personality = EXCLUDED.personality,
           keywords = EXCLUDED.keywords`,
          [agentId, agent.story, agent.personality, JSON.stringify(agent.keywords)]
        );
        
        // 插入服务信息
        await client.query(
          `INSERT INTO agent_service_info 
           (agent_id, services, price_range, business_hours, special_tags)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (agent_id) DO UPDATE SET
           services = EXCLUDED.services,
           business_hours = EXCLUDED.business_hours,
           special_tags = EXCLUDED.special_tags`,
          [
            agentId,
            JSON.stringify(agent.services),
            agent.price_range,
            agent.business_hours,
            JSON.stringify(agent.special_tags)
          ]
        );
        
        // 插入信任分
        const qualityScore = Math.floor(85 + Math.random() * 15);
        const activityScore = Math.floor(80 + Math.random() * 20);
        const warmthScore = Math.floor(85 + Math.random() * 15);
        const totalScore = Math.floor((qualityScore + activityScore + warmthScore) / 3);
        
        await client.query(
          `INSERT INTO agent_trust_scores 
           (agent_id, quality_score, activity_score, warmth_score, total_score)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (agent_id) DO UPDATE SET
           quality_score = EXCLUDED.quality_score,
           activity_score = EXCLUDED.activity_score,
           warmth_score = EXCLUDED.warmth_score,
           total_score = EXCLUDED.total_score`,
          [agentId, qualityScore, activityScore, warmthScore, totalScore]
        );
        
        console.log(`✅ 商家「${agent.name}」初始化成功 (${agentId})`);
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    
    console.log('\n🎉 测试数据初始化完成！\n');
    
    // 验证数据
    const result = await client.query('SELECT COUNT(*) FROM agents WHERE status = $1', ['active']);
    console.log(`📊 当前活跃商家数量: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 执行
initTestData().catch(console.error);
