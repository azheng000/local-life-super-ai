import { Router } from 'express';
import pg from 'pg';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const { Pool } = pg;
const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// MCP客户端缓存
const mcpClients: Map<string, Client> = new Map();

// GET /api/mcp/:agentId/tools - 获取商家MCP工具列表
router.get('/:agentId/tools', async (req, res) => {
  try {
    const { agentId } = req.params;

    const result = await pool.query(
      'SELECT tools FROM agent_mcp_config WHERE agent_id = $1',
      [agentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '商家MCP配置不存在',
      });
    }

    res.json({
      success: true,
      data: {
        agent_id: agentId,
        tools: result.rows[0].tools || [],
      },
    });
  } catch (error: any) {
    console.error('获取工具列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/mcp/:agentId/call - 调用商家MCP工具
router.post('/:agentId/call', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { tool, arguments: args } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: '缺少tool参数',
      });
    }

    // 获取商家MCP配置
    const configResult = await pool.query(
      'SELECT endpoint FROM agent_mcp_config WHERE agent_id = $1',
      [agentId]
    );

    if (configResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '商家MCP配置不存在',
      });
    }

    const endpoint = configResult.rows[0].endpoint;

    // 创建MCP客户端
    const client = new Client({
      name: 'lingshui-platform-api',
      version: '1.0.0',
    }, {
      capabilities: { tools: {} },
    });

    try {
      // 连接到商家MCP Server
      const transport = new StreamableHTTPClientTransport(new URL(endpoint));
      await client.connect(transport);

      // 调用工具
      const result = await client.callTool({
        name: tool,
        arguments: args || {},
      });

      // 关闭连接
      await client.close();

      res.json({
        success: true,
        data: result,
      });
    } catch (callError: any) {
      await client.close();
      throw callError;
    }
  } catch (error: any) {
    console.error('MCP调用失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/mcp/batch-call - 批量调用多个商家MCP
router.post('/batch-call', async (req, res) => {
  try {
    const { agent_ids, tool, arguments: args } = req.body;

    if (!agent_ids || !Array.isArray(agent_ids) || agent_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少agent_ids参数',
      });
    }

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: '缺少tool参数',
      });
    }

    // 并行调用所有商家
    const results = await Promise.all(
      agent_ids.map(async (agentId: string) => {
        try {
          // 获取MCP配置
          const configResult = await pool.query(
            'SELECT endpoint FROM agent_mcp_config WHERE agent_id = $1',
            [agentId]
          );

          if (configResult.rows.length === 0) {
            return { agent_id: agentId, success: false, error: '配置不存在' };
          }

          const endpoint = configResult.rows[0].endpoint;

          // 创建客户端并调用
          const client = new Client({
            name: 'lingshui-platform-api',
            version: '1.0.0',
          }, {
            capabilities: { tools: {} },
          });

          const transport = new StreamableHTTPClientTransport(new URL(endpoint));
          await client.connect(transport);

          const result = await client.callTool({
            name: tool,
            arguments: args || {},
          });

          await client.close();

          return { agent_id: agentId, success: true, data: result };
        } catch (error: any) {
          return { agent_id: agentId, success: false, error: error.message };
        }
      })
    );

    res.json({
      success: true,
      data: {
        results,
        total: results.length,
        success_count: results.filter(r => r.success).length,
      },
    });
  } catch (error: any) {
    console.error('批量MCP调用失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/mcp/registry - 获取所有注册的商家MCP
router.get('/registry', async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT 
        m.agent_id,
        m.endpoint,
        m.tools,
        b.name,
        b.category,
        b.address,
        t.total_score
      FROM agent_mcp_config m
      JOIN agent_basic_info b ON m.agent_id = b.agent_id
      LEFT JOIN agent_trust_scores t ON m.agent_id = t.agent_id
      JOIN agents a ON m.agent_id = a.agent_id
      WHERE a.status = 'active'
    `;

    const params: any[] = [];

    if (category) {
      query += ' AND b.category = $1';
      params.push(category);
    }

    query += ' ORDER BY t.total_score DESC NULLS LAST';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        agents: result.rows.map(row => ({
          agent_id: row.agent_id,
          name: row.name,
          category: row.category,
          address: row.address,
          endpoint: row.endpoint,
          tools_count: (row.tools || []).length,
          trust_score: row.total_score,
        })),
        total: result.rows.length,
      },
    });
  } catch (error: any) {
    console.error('获取注册表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export { router as mcpRoutes };
