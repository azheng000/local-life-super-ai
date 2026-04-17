import type { Merchant, QuickQuestion } from '../types'

// 模拟商家数据
export const mockMerchants: Merchant[] = [
  {
    id: '1',
    name: '疍家鱼排海鲜坊',
    category: '美食',
    tags: ['海鲜', '本地特色', '水上餐厅'],
    distance: '1.2km',
    address: '陵水县新村镇疍家鱼排区',
    phone: '0898-83345678',
    rating: 4.8,
    reviewCount: 2341,
    description: '正宗疍家风味，新鲜海鲜现捞现做，在渔排上用餐体验独特的海上餐厅氛围。',
    trustScore: { quality: 95, activity: 88, warmth: 92 },
    recommendReason: '本地特色海鲜餐厅，口碑极佳，适合体验陵水疍家文化',
    hours: '10:30-21:00',
    priceRange: '¥80-150/人',
  },
  {
    id: '2',
    name: '香水湾君澜度假酒店',
    category: '住宿',
    tags: ['海景', '度假', '亲子'],
    distance: '8.5km',
    address: '陵水县香水湾香水大道1号',
    phone: '0898-83567888',
    rating: 4.9,
    reviewCount: 5621,
    description: '超五星级海景度假酒店，私人沙滩，无边际泳池，是度假休闲的绝佳选择。',
    trustScore: { quality: 98, activity: 92, warmth: 85 },
    recommendReason: '高端度假首选，设施完善，服务一流，适合蜜月和家庭出游',
    hours: '24小时营业',
    priceRange: '¥1200-3000/晚',
  },
  {
    id: '3',
    name: '分界洲岛风景区',
    category: '景点',
    tags: ['海岛', '潜水', '观光'],
    distance: '12km',
    address: '陵水县牛岭分界洲岛',
    phone: '0898-83341234',
    rating: 4.7,
    reviewCount: 8902,
    description: '国家5A级景区，海水清澈见底，是潜水爱好者的天堂，还有丰富的海上娱乐项目。',
    trustScore: { quality: 96, activity: 95, warmth: 80 },
    recommendReason: '陵水必打卡景点，海水质量极佳，潜水体验一流',
    hours: '08:30-17:30',
    priceRange: '¥128门票',
  },
  {
    id: '4',
    name: '清水湾高尔夫球会',
    category: '运动',
    tags: ['高尔夫', '休闲', '会员制'],
    distance: '15km',
    address: '陵水县清水湾旅游度假区',
    phone: '0898-83355666',
    rating: 4.8,
    reviewCount: 1234,
    description: '国际标准18洞海景高尔夫球场，由知名设计师精心打造，环境优美，设施完备。',
    trustScore: { quality: 94, activity: 78, warmth: 85 },
    recommendReason: '海景高尔夫体验，球场品质高，适合商务接待和休闲运动',
    hours: '06:30-18:30',
    priceRange: '¥680-980/场',
  },
  {
    id: '5',
    name: '陵水动车站接驳服务',
    category: '出行',
    tags: ['接送', '包车', '拼车'],
    distance: '陵水站',
    address: '陵水动车站',
    phone: '138-7654-3210',
    rating: 4.6,
    reviewCount: 3567,
    description: '提供陵水动车站到各大景区、酒店的接送服务，24小时在线预约。',
    trustScore: { quality: 88, activity: 90, warmth: 95 },
    recommendReason: '动车站接送便捷，司机服务热情，价格透明合理',
    hours: '24小时',
    priceRange: '¥50-200/趟',
  },
  {
    id: '6',
    name: '南湾猴岛',
    category: '景点',
    tags: ['亲子', '生态', '猕猴'],
    distance: '5km',
    address: '陵水县新村镇南湾半岛',
    phone: '0898-83346789',
    rating: 4.6,
    reviewCount: 6543,
    description: '我国唯一的岛屿型猕猴自然保护区，可以近距离观赏猕猴表演，体验缆车跨海。',
    trustScore: { quality: 90, activity: 92, warmth: 88 },
    recommendReason: '亲子游必去，猕猴可爱有趣，缆车风景绝美',
    hours: '08:30-17:30',
    priceRange: '¥160门票+缆车',
  },
  {
    id: '7',
    name: '椰田古寨',
    category: '景点',
    tags: ['黎苗文化', '非遗', '民俗'],
    distance: '7km',
    address: '陵水县英州镇椰田古寨',
    phone: '0898-83456789',
    rating: 4.5,
    reviewCount: 4321,
    description: '展示黎苗族传统文化的景区，有非遗传承人手把手教你制作黎族织锦、藤编等。',
    trustScore: { quality: 88, activity: 85, warmth: 90 },
    recommendReason: '了解黎苗文化的好去处，非遗体验有趣，适合带孩子学习',
    hours: '08:30-18:00',
    priceRange: '¥60门票',
  },
  {
    id: '8',
    name: '新村夜市一条街',
    category: '美食',
    tags: ['夜市', '小吃', '本地'],
    distance: '800m',
    address: '陵水县新村镇和平路',
    phone: '',
    rating: 4.4,
    reviewCount: 2089,
    description: '本地最具人气的夜市，汇集了各种陵水特色小吃，价格实惠，味道正宗。',
    trustScore: { quality: 82, activity: 95, warmth: 98 },
    recommendReason: '体验当地夜生活的好去处，小吃丰富多样，充满烟火气',
    hours: '18:00-23:00',
    priceRange: '¥20-50/人',
  },
]

// 快捷问题
export const quickQuestions: QuickQuestion[] = [
  { id: '1', text: '附近有什么好吃的？', icon: '🍜' },
  { id: '2', text: '帮我找酒店', icon: '🏨' },
  { id: '3', text: '景点推荐', icon: '🏝️' },
  { id: '4', text: '用车服务', icon: '🚗' },
]

// 生成唯一ID
export const generateId = () => Math.random().toString(36).substring(2, 15)

// 根据关键词过滤商家
export const filterMerchants = (keyword: string): Merchant[] => {
  const lowerKeyword = keyword.toLowerCase()
  
  return mockMerchants.filter((merchant) => {
    const searchText = `${merchant.name} ${merchant.category} ${merchant.tags.join(' ')} ${merchant.description}`.toLowerCase()
    return searchText.includes(lowerKeyword)
  })
}

// 生成AI响应
export const generateAIResponse = (userMessage: string, merchants: Merchant[]) => {
  const lowerMsg = userMessage.toLowerCase()
  let recommendations: Merchant[] = []
  let responseText = ''
  
  if (lowerMsg.includes('吃') || lowerMsg.includes('美食') || lowerMsg.includes('海鲜') || lowerMsg.includes('餐厅')) {
    recommendations = merchants.filter(m => m.category === '美食').slice(0, 3)
    responseText = `为您找到${recommendations.length}家美食推荐！这些都是陵水本地口碑很好的餐厅，来看看有没有您喜欢的～`
  } else if (lowerMsg.includes('酒店') || lowerMsg.includes('住宿') || lowerMsg.includes('住')) {
    recommendations = merchants.filter(m => m.category === '住宿').slice(0, 3)
    responseText = `为您精选${recommendations.length}家优质住宿！陵水有不少高端度假酒店，来看看哪个更适合您～`
  } else if (lowerMsg.includes('景点') || lowerMsg.includes('玩') || lowerMsg.includes('景区') || lowerMsg.includes('推荐')) {
    recommendations = merchants.filter(m => m.category === '景点').slice(0, 3)
    responseText = `陵水好玩的景点来啦！${recommendations.length}个精选推荐，涵盖海岛、亲子、文化体验，快来挑选吧～`
  } else if (lowerMsg.includes('车') || lowerMsg.includes('接送') || lowerMsg.includes('出行') || lowerMsg.includes('用车')) {
    recommendations = merchants.filter(m => m.category === '出行').slice(0, 3)
    responseText = `为您准备了出行服务选项！陵水出行很方便，看看这些接送服务是否适合您～`
  } else {
    // 根据关键词匹配
    const matched = filterMerchants(userMessage)
    if (matched.length > 0) {
      recommendations = matched.slice(0, 3)
      responseText = `根据您的需求，为您找到以下推荐：`
    } else {
      recommendations = merchants.slice(0, 3)
      responseText = `您好！我是陵水本地生活助手，我来为您推荐一些本地优质商家吧～`
    }
  }
  
  return { text: responseText, recommendations }
}
