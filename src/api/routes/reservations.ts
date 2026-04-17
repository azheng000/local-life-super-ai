import { Router } from 'express';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const { Pool } = pg;
const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 验证模式
const reservationSchema = z.object({
  agent_id: z.string().min(1),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  party_size: z.number().int().positive().optional().default(1),
  notes: z.string().optional(),
  source: z.enum(['douyin', 'meituan', 'wechat', 'mini_program', 'direct']).optional().default('direct'),
});

const confirmSchema = z.object({
  reservation_id: z.string().min(1),
  action: z.enum(['confirm', 'cancel']),
  reason: z.string().optional(),
});

// 生成核销码
function generateVerificationCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + 
         Math.random().toString(36).slice(2, 4).toUpperCase();
}

// POST /api/reservations - 创建预约
router.post('/', async (req, res) => {
  try {
    const validatedData = reservationSchema.parse(req.body);
    const reservationId = `RSV_${Date.now()}_${uuidv4().slice(0, 8).toUpperCase()}`;
    const verificationCode = generateVerificationCode();

    const result = await pool.query(
      `INSERT INTO reservations (
        reservation_id, agent_id, customer_name, customer_phone,
        reservation_date, reservation_time, party_size, notes, status,
        source, verification_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
      RETURNING *`,
      [
        reservationId,
        validatedData.agent_id,
        validatedData.customer_name,
        validatedData.customer_phone,
        validatedData.date,
        validatedData.time || null,
        validatedData.party_size,
        validatedData.notes || null,
        validatedData.source,
        verificationCode,
      ]
    );

    // 发送通知给商家
    await sendNotification({
      type: 'new_reservation',
      reservation_id: reservationId,
      agent_id: validatedData.agent_id,
      customer_name: validatedData.customer_name,
      customer_phone: validatedData.customer_phone,
      date: validatedData.date,
      time: validatedData.time,
      party_size: validatedData.party_size,
      verification_code: verificationCode,
    });

    // 更新商家活跃分
    await pool.query(
      `UPDATE agent_trust_scores SET 
        activity_score = LEAST(activity_score + 0.5, 100),
        updated_at = NOW()
      WHERE agent_id = $1`,
      [validatedData.agent_id]
    );

    console.log(`✅ 预约创建成功: ${reservationId}`);

    res.json({
      success: true,
      data: {
        reservation_id: reservationId,
        verification_code: verificationCode,
        message: '预约成功！商家会尽快确认，请保持电话畅通。',
      },
    });
  } catch (error: any) {
    console.error('创建预约失败:', error);

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
  }
});

// GET /api/reservations - 查询预约列表
router.get('/', async (req, res) => {
  try {
    const { agent_id, status, customer_phone, date, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        r.*,
        b.name as agent_name,
        b.contact as agent_contact
      FROM reservations r
      LEFT JOIN agent_basic_info b ON r.agent_id = b.agent_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (agent_id) {
      query += ` AND r.agent_id = $${paramIndex}`;
      params.push(agent_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (customer_phone) {
      query += ` AND r.customer_phone = $${paramIndex}`;
      params.push(customer_phone);
      paramIndex++;
    }

    if (date) {
      query += ` AND r.reservation_date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    // 获取总数
    let countQuery = `SELECT COUNT(*) FROM reservations WHERE 1=1`;
    const countParams: any[] = [];
    let countIndex = 1;

    if (agent_id) {
      countQuery += ` AND agent_id = $${countIndex}`;
      countParams.push(agent_id);
      countIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (customer_phone) {
      countQuery += ` AND customer_phone = $${countIndex}`;
      countParams.push(customer_phone);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        reservations: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
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

// GET /api/reservations/:id - 获取预约详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        r.*,
        b.name as agent_name,
        b.contact as agent_contact,
        b.address as agent_address
      FROM reservations r
      LEFT JOIN agent_basic_info b ON r.agent_id = b.agent_id
      WHERE r.reservation_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '预约不存在',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('查询失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/reservations/confirm - 商家确认预约
router.post('/confirm', async (req, res) => {
  try {
    const validatedData = confirmSchema.parse(req.body);
    const { reservation_id, action, reason } = validatedData;

    // 检查预约是否存在
    const check = await pool.query(
      'SELECT * FROM reservations WHERE reservation_id = $1',
      [reservation_id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '预约不存在',
      });
    }

    const reservation = check.rows[0];

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

      // 通知用户（模拟）
      await sendNotification({
        type: 'reservation_confirmed',
        reservation_id,
        agent_id: reservation.agent_id,
        customer_name: reservation.customer_name,
        customer_phone: reservation.customer_phone,
        date: reservation.reservation_date,
        time: reservation.reservation_time,
        verification_code: reservation.verification_code,
      });

      console.log(`✅ 预约已确认: ${reservation_id}`);

      res.json({
        success: true,
        message: '预约已确认',
      });
    } else if (action === 'cancel') {
      await pool.query(
        `UPDATE reservations SET 
          status = 'cancelled',
          notes = COALESCE(notes, '') || ' [取消原因: ' || $2 || ']',
          updated_at = NOW()
        WHERE reservation_id = $1`,
        [reservation_id, reason || '商家取消']
      );

      // 通知用户（模拟）
      await sendNotification({
        type: 'reservation_cancelled',
        reservation_id,
        agent_id: reservation.agent_id,
        customer_name: reservation.customer_name,
        customer_phone: reservation.customer_phone,
      });

      console.log(`❌ 预约已取消: ${reservation_id}`);

      res.json({
        success: true,
        message: '预约已取消',
      });
    }
  } catch (error: any) {
    console.error('确认失败:', error);

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
  }
});

// POST /api/reservations/:id/verify - 核销预约
router.post('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_code } = req.body;

    // 查询预约
    const check = await pool.query(
      'SELECT * FROM reservations WHERE reservation_id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '预约不存在',
      });
    }

    const reservation = check.rows[0];

    // 验证核销码
    if (reservation.verification_code !== verification_code) {
      return res.status(400).json({
        success: false,
        error: '核销码错误',
      });
    }

    // 检查状态
    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: '预约已核销',
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: '预约已取消',
      });
    }

    // 核销
    await pool.query(
      `UPDATE reservations SET 
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE reservation_id = $1`,
      [id]
    );

    // 更新商家质量分
    await pool.query(
      `UPDATE agent_trust_scores SET 
        quality_score = LEAST(quality_score + 2, 100),
        updated_at = NOW()
      WHERE agent_id = $1`,
      [reservation.agent_id]
    );

    console.log(`✅ 预约已核销: ${id}`);

    res.json({
      success: true,
      message: '核销成功，欢迎下次光临！',
    });
  } catch (error: any) {
    console.error('核销失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 辅助函数：发送通知
async function sendNotification(notification: any) {
  try {
    const APP_URL = process.env.APP_URL || 'http://localhost:3001';
    await fetch(`${APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...notification,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('发送通知失败:', error);
  }
}

export { router as reservationRoutes };
