import express from 'express';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import {
  Server,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

dotenv.config();

const { Pool } = pg;

// 从环境变量获取配置
const AGENT_ID = process.env.AGENT_ID || 'AGT_default';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lingshui_local_life';
const PORT = parseInt(process.env.MCP_SERVER_PORT || '3000');
const APP_URL = process.env.APP_URL || 'http://localhost:3001';

const pool = new Pool({ connectionString: DATABASE_URL });

// 创建MCP Server
const server = new Server(
  {
    name: `lingshui-agent-${AGENT_ID}`,
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ==================== MCP 工具定义 ====================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_business_info',
        description: '获取商家基本信息，包括营业时间、地址、联系方式、特色标签等',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_menu',
        description: '获取菜单或服务项目列表，支持按分类筛选',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '菜品/服务分类（可选），如"招牌菜"、"优惠套餐"',
            },
          },
        },
      },
      {
        name: 'check_availability',
        description: '🔥 核心功能：查询预约可用时间/库存。这是提升抖音核销率的关键！',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: '日期 YYYY-MM-DD',
            },
            party_size: {
              type: 'number',
              description: '人数（餐饮场景）或数量',
            },
            time: {
              type: 'string',
              description: '期望时间 HH:MM（可选）',
            },
          },
          required: ['date'],
        },
      },
      {
        name: 'make_reservation',
        description: '🔥 核心功能：预约/下单！会自动推送给商家，秒级确认。解决抖音核销率痛点的关键！',
        inputSchema: {
          type: 'object',
          properties: {
            customer_name: {
              type: 'string',
              description: '顾客姓名',
            },
            customer_phone: {
              type: 'string',
              description: '顾客联系电话',
            },
            date: {
              type: 'string',
              description: '预约日期 YYYY-MM-DD',
            },
            time: {
              type: 'string',
              description: '预约时间 HH:MM（可选）',
            },
            party_size: {
              type: 'number',
              description: '人数',
            },
            notes: {
              type: 'string',
              description: '备注，如特殊需求',
            },
          },
          required: ['customer_name', 'customer_phone', 'date'],
        },
      },
      {
        name: 'get_story',
        description: '获取商家故事和品牌特色。解决"AI无人情味"痛点，让用户感受到真实的商家',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// ==================== 工具调用处理 ====================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.log(`[${AGENT_ID}] 调用工具: ${name}`, args);

  try {
    switch (name) {
      case 'get_business_info':
        return await getBusinessInfo();
      case 'get_menu':
        return await getMenu(args?.category);
      case 'check_availability':
        return await checkAvailability(args?.date, args?.party_size, args?.time);
      case 'make_reservation':
        return await makeReservation(args);
      case 'get_story':
        return await getStory();
      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error: any) {
    console.error(`[${AGENT_ID}] 工具调用失败:`, error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: error.message }),
        },
      ],
      isError: true,
    };
  }
});

// ==================== 工具实现 ====================

async function getBusinessInfo() {
  const result = await pool.query(
    `SELECT 
      b.name, b.category, b.address, b.contact, b.owner_name,
      s.business_hours, s.price_range, s.special_tags, s.services,
      t.quality_score, t.activity_score, t.warmth_score
    FROM agent_basic_info b
    LEFT JOIN agent_service_info s ON b.agent_id = s.agent_id
    LEFT JOIN agent_trust_scores t ON b.agent_id = t.agent_id
    WHERE b.agent_id = $1
  `,
    [AGENT_ID]
  );

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: '商家不存在' }),
        },
      ],
    };
  }

  const info = result.rows[0];

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            data: {
              name: info.name,
              category: info.category,
              address: info.address,
              contact: info.contact,
              owner: info.owner_name || '商家',
              hours: info.business_hours,
              price_range: info.price_range
                ? `¥${info.price_range[0]}-${info.price_range[1]}`
                : '价格面议',
              special_tags: info.special_tags || [],
              trust_score: {
                quality: info.quality_score || 50,
                activity: info.activity_score || 100,
                warmth: info.warmth_score || 50,
              },
            },
          },
          null,
          2
        ),
      },
    ],
  };
}

async function getMenu(category?: string) {
  const result = await pool.query(
    `SELECT services FROM agent_service_info WHERE agent_id = $1`,
    [AGENT_ID]
  );

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: '暂无服务信息' }),
        },
      ],
    };
  }

  let services = result.rows[0].services || [];
  
  // 按分类筛选
  if (category) {
    services = services.filter(
      (s: any) => s.category === category || s.name.includes(category)
    );
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            data: {
              items: services,
              total: services.length,
            },
          },
          null,
          2
        ),
      },
    ],
  };
}

async function checkAvailability(date: string, partySize?: number, time?: string) {
  // 模拟可用性检查逻辑
  // 实际应用中应该查询预订表来确定真实可用性
  
  const today = new Date().toISOString().split('T')[0];
  
  if (new Date(date) < new Date(today)) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: '无法预订过去的日期',
          }),
        },
      ],
    };
  }

  // 模拟返回可用时段
  const availableSlots = ['11:00', '12:00', '18:00', '19:00', '20:00'];
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: {
            date,
            available: true,
            party_size: partySize || 1,
            available_slots: availableSlots,
            message: `您选择的${date}有位置，欢迎预约！`,
          },
        }, null, 2),
      },
    ],
  };
}

async function makeReservation(args: any) {
  const {
    customer_name,
    customer_phone,
    date,
    time,
    party_size,
    notes,
  } = args;

  // 生成预约ID和核销码
  const reservationId = `RSV_${Date.now()}_${uuidv4().slice(0, 8).toUpperCase()}`;
  const verificationCode = generateVerificationCode();

  // 保存预约记录
  await pool.query(
    `INSERT INTO reservations (
      reservation_id, agent_id, customer_name, customer_phone,
      reservation_date, reservation_time, party_size, notes, status,
      source, verification_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'douyin', $9)`,
    [
      reservationId,
      AGENT_ID,
      customer_name,
      customer_phone,
      date,
      time || null,
      party_size || 1,
      notes || null,
      verificationCode,
    ]
  );

  // 🔥 关键：实时推送给商家（微信模板消息）
  await notifyMerchant({
    type: 'new_reservation',
    reservation_id: reservationId,
    agent_id: AGENT_ID,
    customer_name,
    customer_phone,
    date,
    time,
    party_size,
    verification_code: verificationCode,
  });

  // 更新活跃分（商家响应越快，分数越高）
  await pool.query(
    `UPDATE agent_trust_scores SET 
      activity_score = LEAST(activity_score + 0.5, 100),
      updated_at = NOW()
    WHERE agent_id = $1`,
    [AGENT_ID]
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: {
            reservation_id: reservationId,
            verification_code: verificationCode,
            message: `预约成功！\n预约号：${reservationId}\n核销码：${verificationCode}\n商家会马上确认，请保持电话畅通！`,
          },
        }, null, 2),
      },
    ],
  };
}

async function getStory() {
  const result = await pool.query(
    `SELECT story, personality, keywords FROM agent_brand_info WHERE agent_id = $1`,
    [AGENT_ID]
  );

  if (result.rows.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ story: '暂无品牌故事' }),
        },
      ],
    };
  }

  const brand = result.rows[0];

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: {
            story: brand.story || `${AGENT_ID}暂未填写品牌故事`,
            personality: brand.personality || '热情服务',
            keywords: brand.keywords || [],
          },
        }, null, 2),
      },
    ],
  };
}

// ==================== 辅助函数 ====================

function generateVerificationCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + 
         Math.random().toString(36).slice(2, 4).toUpperCase();
}

// 🔥 核心功能：推送通知给商家
async function notifyMerchant(notification: any) {
  try {
    // 发送到平台的通知API
    const response = await fetch(`${APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...notification,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      console.log(`[${AGENT_ID}] 商家通知已发送`);
    } else {
      console.error(`[${AGENT_ID}] 通知发送失败:`, await response.text());
    }
  } catch (error) {
    console.error(`[${AGENT_ID}] 通知发送异常:`, error);
  }
}

// ==================== 启动服务器 ====================

async function main() {
  const transport = new StreamableHTTPServerTransport({
    validateIncomingRequest: (req) => {
      // 允许跨域
      return true;
    },
  });

  server.connect(transport);

  const app = express();
  app.use(express.json());

  // CORS配置
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, MCP-Session-Id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // MCP端点
  app.all('/mcp', async (req, res) => {
    await transport.handleRequest(req, res);
  });

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', agent_id: AGENT_ID });
  });

  // 商家确认预约接口
  app.post('/api/confirm', async (req, res) => {
    try {
      const { reservation_id, action, reason } = req.body;
      
      if (action === 'confirm') {
        await pool.query(
          `UPDATE reservations SET 
            status = 'confirmed',
            merchant_confirmed = TRUE,
            confirmed_at = NOW(),
            updated_at = NOW()
          WHERE reservation_id = $1`,
          [reservation_id]
        );
        
        res.json({ success: true, message: '预约已确认' });
      } else if (action === 'cancel') {
        await pool.query(
          `UPDATE reservations SET 
            status = 'cancelled',
            notes = COALESCE(notes, '') || ' [取消原因: ' || $2 || ']',
            updated_at = NOW()
          WHERE reservation_id = $1`,
          [reservation_id, reason || '商家取消']
        );
        
        res.json({ success: true, message: '预约已取消' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`🔥 Agent ${AGENT_ID} MCP Server running on port ${PORT}`);
    console.log(`   MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });
}

main().catch(console.error);
