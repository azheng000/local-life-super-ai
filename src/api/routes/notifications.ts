import { Router } from 'express';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;
const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 🔥 订单实时推送功能（抖音核销率痛点核心）

// POST /api/notifications/send - 发送通知（模拟微信模板消息）
router.post('/send', async (req, res) => {
  try {
    const notification = req.body;
    const notificationId = `NOTIF_${Date.now()}_${uuidv4().slice(0, 8).toUpperCase()}`;

    console.log(`📱 收到通知请求:`, notification);

    // 保存通知记录
    const result = await pool.query(
      `INSERT INTO notifications (
        notification_id, reservation_id, agent_id, notification_type,
        channel, recipient, content, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *`,
      [
        notificationId,
        notification.reservation_id,
        notification.agent_id,
        notification.type,
        'wechat',
        notification.customer_phone,
        JSON.stringify(notification),
      ]
    );

    // 模拟微信模板消息发送
    // 实际应用中，这里应该调用微信API
    const wechatResult = await simulateWechatTemplateMessage(notification);

    if (wechatResult.success) {
      await pool.query(
        `UPDATE notifications SET 
          status = 'sent',
          sent_at = NOW(),
          delivered_at = NOW(),
          updated_at = NOW()
        WHERE notification_id = $1`,
        [notificationId]
      );
    } else {
      await pool.query(
        `UPDATE notifications SET 
          status = 'failed',
          error_message = $2,
          updated_at = NOW()
        WHERE notification_id = $1`,
        [notificationId, wechatResult.error]
      );
    }

    console.log(`✅ 通知处理完成: ${notificationId} - ${wechatResult.success ? '成功' : '失败'}`);

    res.json({
      success: true,
      notification_id: notificationId,
      channel: 'wechat',
      result: wechatResult,
    });
  } catch (error: any) {
    console.error('通知发送失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/notifications - 查询通知列表
router.get('/', async (req, res) => {
  try {
    const { agent_id, status, limit = 20, offset = 0 } = req.query;

    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (agent_id) {
      query += ` AND agent_id = $${paramIndex}`;
      params.push(agent_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        total: result.rows.length,
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

// GET /api/notifications/stats - 获取通知统计（用于核销率分析）
router.get('/stats', async (req, res) => {
  try {
    const { agent_id, start_date, end_date } = req.query;

    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (agent_id) {
      whereClause += ` AND agent_id = $${paramIndex}`;
      params.push(agent_id);
      paramIndex++;
    }

    if (start_date) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }

    // 总通知数
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM notifications WHERE ${whereClause}`,
      params
    );

    // 按状态统计
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM notifications WHERE ${whereClause}
       GROUP BY status`,
      params
    );

    // 计算核销率（completed / total）
    const total = parseInt(totalResult.rows[0].total);
    const statusMap: Record<string, number> = {};
    statusResult.rows.forEach(row => {
      statusMap[row.status] = parseInt(row.count);
    });

    const completed = statusMap['completed'] || 0;
    const confirmed = statusMap['confirmed'] || 0;
    const pending = statusMap['pending'] || 0;

    res.json({
      success: true,
      data: {
        total,
        by_status: statusMap,
        verification_rate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%',
        confirmation_rate: total > 0 ? ((confirmed / total) * 100).toFixed(2) + '%' : '0%',
        pending_count: pending,
      },
    });
  } catch (error: any) {
    console.error('统计失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 模拟微信模板消息发送
async function simulateWechatTemplateMessage(notification: any): Promise<{ success: boolean; error?: string }> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));

  // 模拟发送结果
  const success = Math.random() > 0.1; // 90%成功率

  if (success) {
    console.log(`📱 [模拟微信] 发送模板消息给 ${notification.customer_phone}:`);
    console.log(`   类型: ${getNotificationTypeText(notification.type)}`);
    console.log(`   预约号: ${notification.reservation_id}`);
    
    if (notification.verification_code) {
      console.log(`   核销码: ${notification.verification_code}`);
    }

    return { success: true };
  } else {
    return { success: false, error: '微信模板消息发送失败（模拟）' };
  }
}

function getNotificationTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'new_reservation': '新预约通知',
    'reservation_confirmed': '预约确认通知',
    'reservation_cancelled': '预约取消通知',
    'verification': '核销成功通知',
  };
  return typeMap[type] || type;
}

export { router as notificationRoutes };
