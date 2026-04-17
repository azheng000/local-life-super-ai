// MCP默认工具配置

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

// 获取默认工具列表
export function getDefaultTools(agentId: string): MCPTool[] {
  return [
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
            description: '菜品/服务分类（可选）',
          },
        },
      },
    },
    {
      name: 'check_availability',
      description: '查询预约可用时间/库存',
      inputSchema: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: '日期 YYYY-MM-DD',
          },
          party_size: {
            type: 'number',
            description: '人数',
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
      description: '预约/下单！会自动推送给商家，秒级确认',
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
            description: '备注',
          },
        },
        required: ['customer_name', 'customer_phone', 'date'],
      },
    },
    {
      name: 'get_story',
      description: '获取商家故事和品牌特色',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

// 餐饮行业专用工具
export function getRestaurantTools(agentId: string): MCPTool[] {
  return [
    ...getDefaultTools(agentId),
    {
      name: 'get_recommended_dishes',
      description: '获取商家招牌菜推荐',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'check_daily_special',
      description: '获取今日特价菜',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

// 酒店行业专用工具
export function getHotelTools(agentId: string): MCPTool[] {
  return [
    ...getDefaultTools(agentId),
    {
      name: 'get_room_types',
      description: '获取房型列表',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'check_room_availability',
      description: '查询房间可用性',
      inputSchema: {
        type: 'object',
        properties: {
          check_in: {
            type: 'string',
            description: '入住日期 YYYY-MM-DD',
          },
          check_out: {
            type: 'string',
            description: '退房日期 YYYY-MM-DD',
          },
          guests: {
            type: 'number',
            description: '入住人数',
          },
        },
        required: ['check_in', 'check_out'],
      },
    },
  ];
}
