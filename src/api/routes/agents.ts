import { Router } from 'express';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getDefaultTools } from '../services/mcp-tools.js';

const { Pool } = pg;
const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 验证模式
const registerSchema = z.object({
  agent_type: z.enum(['merchant', 'individual']).optional().default('merchant'),
  name: z.string().min(1),
  category: z.string().min(1),
  address: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  contact: z.string().min(1),
  owner_name: z.string().optional(),
  story: z.string().optional(),
  personality: z.string().optional().default('warm_and_friendly'),
  keywords: z.array(z.string()).optional(),
  services: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    category: z.string().optional(),
  })).optional(),
  price_range: z.tuple([z.number(), z.number()]).optional(),
  business_hours: z.string().optional().default('09:00-21:00'),
  special_tags: z.array(z.string()).optional(),
});

// POST /api/agents/register - 注册商家智能体
router.post('/register', async (req, res) => {
  const client = await pool.connect();

  try {
    // 验证请求数据
    const validatedData = registerSchema.parse(req.body);

    await client.query('BEGIN');

    // 1. 生成智能体ID
    const agentId = `AGT_${Date.now()}_${uuidv4().slice(0, 8).toUpperCase()}`;

    // 2. 插入智能体主记录
    const agentResult = await client.query(
      `INSERT INTO agents (agent_id, agent_type, status, created_at)
       VALUES ($1, $2, 'active', NOW())
       RETURNING id`,
      [agentId, validatedData.agent_type]
    );

    // 3. 插入基础信息
    await client.query(
      `INSERT INTO agent_basic_info 
       (agent_id, name, category, address, lat, lng, contact, owner_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        agentId,
        validatedData.name,
        validatedData.category,
        validatedData.address,
        validatedData.lat || null,
        validatedData.lng || null,
        validatedData.contact,
        validatedData.owner_name || null,
      ]
    );

    // 4. 插入品牌信息
    await client.query(
      `INSERT INTO agent_brand_info 
       (agent_id, story, personality, keywords)
       VALUES ($1, $2, $3, $4)`,
      [
        agentId,
        validatedData.story || '',
        validatedData.personality,
        validatedData.keywords || [],
      ]
    );

    // 5. 插入服务信息
    await client.query(
      `INSERT INTO agent_service_info 
       (agent_id, services, price_range, business_hours, special_tags)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        agentId,
        JSON.stringify(validatedData.services || []),
        validatedData.price_range || null,
        validatedData.business_hours,
        validatedData.special_tags || [],
      ]
    );

    // 6. 初始化信任分
    await client.query(
      `INSERT INTO agent_trust_scores 
       (agent_id, quality_score, activity_score, warmth_score, total_score)
       VALUES ($1, 50, 100, 50, 65)`,
      [agentId]
    );

    // 7. 生成MCP配置
    const mcpEndpoint = `${process.env.APP_URL || 'http://localhost:3001'}/api/mcp/${agentId}`;
    const tools = getDefaultTools(agentId);
    
    await client.query(
      `INSERT INTO agent_mcp_config 
       (agent_id, endpoint, tools)
       VALUES ($1, $2, $3)`,
      [agentId, mcpEndpoint, JSON.stringify(tools)]
    );

    await client.query('COMMIT');

    // 生成二维码URL（模拟）
    const qrcodeUrl = `${process.env.APP_URL || 'http://localhost:3001'}/qrcode/${agentId}`;

    console.log(`✅ 商家智能体注册成功: ${agentId}`);

    res.json({
      success: true,
      agent_id: agentId,
      mcp_endpoint: mcpEndpoint,
      qrcode_url: qrcodeUrl,
      message: `智能体「${validatedData.name}」注册成功！`,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('注册失败:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: '数据验证失败',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// GET /api/agents - 查询商家列表
router.get('/', async (req, res) => {
  try {
    const { category, lat, lng, radius = 5000, limit = 10 } = req.query;

    let query = `
      SELECT 
        a.agent_id,
        b.name,
        b.category,
        b.address,
        b.contact,
        b.owner_name,
        s.business_hours,
        s.price_range,
        s.special_tags,
        t.quality_score,
        t.activity_score,
        t.warmth_score,
        t.total_score,
        m.endpoint as mcp_endpoint
      FROM agents a
      JOIN agent_basic_info b ON a.agent_id = b.agent_id
      LEFT JOIN agent_service_info s ON a.agent_id = s.agent_id
      LEFT JOIN agent_trust_scores t ON a.agent_id = t.agent_id
      LEFT JOIN agent_mcp_config m ON a.agent_id = m.agent_id
      WHERE a.status = 'active'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND b.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ' ORDER BY t.total_score DESC NULLS LAST';

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit as string));
    }

    const result = await pool.query(query, params);

    const agents = result.rows.map((row) => ({
      agent_id: row.agent_id,
      name: row.name,
      category: row.category,
      address: row.address,
      contact: row.contact,
      owner: row.owner_name,
      hours: row.business_hours,
      price_range: row.price_range
        ? `¥${row.price_range[0]}-${row.price_range[1]}`
        : null,
      special_tags: row.special_tags || [],
      trust_score: {
        quality: row.quality_score || 50,
        activity: row.activity_score || 100,
        warmth: row.warmth_score || 50,
        total: row.total_score || 65,
      },
      mcp_endpoint: row.mcp_endpoint,
    }));

    res.json({
      success: true,
      data: {
        agents,
        total: agents.length,
      },
    });
  } catch (error: any) {
    console.error('查询失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/agents/:agentId - 获取单个商家详情
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    const result = await pool.query(
      `SELECT 
        a.agent_id,
        a.agent_type,
        a.status,
        b.name,
        b.category,
        b.address,
        b.lat,
        b.lng,
        b.contact,
        b.owner_name,
        s.services,
        s.business_hours,
        s.price_range,
        s.special_tags,
        t.quality_score,
        t.activity_score,
        t.warmth_score,
        t.total_score,
        m.endpoint as mcp_endpoint,
        m.tools,
        brand.story,
        brand.personality,
        brand.keywords
      FROM agents a
      JOIN agent_basic_info b ON a.agent_id = b.agent_id
      LEFT JOIN agent_service_info s ON a.agent_id = s.agent_id
      LEFT JOIN agent_trust_scores t ON a.agent_id = t.agent_id
      LEFT JOIN agent_mcp_config m ON a.agent_id = m.agent_id
      LEFT JOIN agent_brand_info brand ON a.agent_id = brand.agent_id
      WHERE a.agent_id = $1`,
      [agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '商家不存在',
      });
    }

    const row = result.rows[0];

    res.json({
      success: true,
      data: {
        agent_id: row.agent_id,
        agent_type: row.agent_type,
        status: row.status,
        name: row.name,
        category: row.category,
        address: row.address,
        location: {
          lat: row.lat,
          lng: row.lng,
        },
        contact: row.contact,
        owner: row.owner_name,
        services: row.services || [],
        business_hours: row.business_hours,
        price_range: row.price_range,
        special_tags: row.special_tags || [],
        brand: {
          story: row.story,
          personality: row.personality,
          keywords: row.keywords || [],
        },
        trust_score: {
          quality: row.quality_score || 50,
          activity: row.activity_score || 100,
          warmth: row.warmth_score || 50,
          total: row.total_score || 65,
        },
        mcp_endpoint: row.mcp_endpoint,
        tools: row.tools || [],
      },
    });
  } catch (error: any) {
    console.error('查询失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/agents/:agentId - 更新商家信息
router.put('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const updates = req.body;

    // 检查商家是否存在
    const check = await pool.query(
      'SELECT agent_id FROM agents WHERE agent_id = $1',
      [agentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '商家不存在',
      });
    }

    // 更新基础信息
    if (updates.name || updates.category || updates.address || updates.contact) {
      await pool.query(
        `UPDATE agent_basic_info SET
         name = COALESCE($2, name),
         category = COALESCE($3, category),
         address = COALESCE($4, address),
         contact = COALESCE($5, contact),
         owner_name = COALESCE($6, owner_name),
         updated_at = NOW()
         WHERE agent_id = $1`,
        [
          agentId,
          updates.name,
          updates.category,
          updates.address,
          updates.contact,
          updates.owner_name,
        ]
      );
    }

    // 更新服务信息
    if (updates.services || updates.business_hours || updates.price_range) {
      await pool.query(
        `UPDATE agent_service_info SET
         services = COALESCE($2, services),
         business_hours = COALESCE($3, business_hours),
         price_range = COALESCE($4, price_range),
         special_tags = COALESCE($5, special_tags),
         updated_at = NOW()
         WHERE agent_id = $1`,
        [
          agentId,
          updates.services ? JSON.stringify(updates.services) : null,
          updates.business_hours,
          updates.price_range,
          updates.special_tags,
        ]
      );
    }

    // 更新品牌信息
    if (updates.story !== undefined || updates.personality) {
      await pool.query(
        `UPDATE agent_brand_info SET
         story = COALESCE($2, story),
         personality = COALESCE($3, personality),
         keywords = COALESCE($4, keywords),
         updated_at = NOW()
         WHERE agent_id = $1`,
        [
          agentId,
          updates.story,
          updates.personality,
          updates.keywords,
        ]
      );
    }

    // 更新主表
    await pool.query(
      `UPDATE agents SET updated_at = NOW() WHERE agent_id = $1`,
      [agentId]
    );

    res.json({
      success: true,
      message: '商家信息已更新',
    });
  } catch (error: any) {
    console.error('更新失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/agents/:agentId - 删除商家
router.delete('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    await pool.query(
      `UPDATE agents SET status = 'inactive', updated_at = NOW() WHERE agent_id = $1`,
      [agentId]
    );

    res.json({
      success: true,
      message: '商家已停用',
    });
  } catch (error: any) {
    console.error('删除失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as agentRoutes };
