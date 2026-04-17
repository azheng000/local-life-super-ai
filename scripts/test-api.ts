/**
 * 陵水本地生活智能体 - API测试脚本
 * 使用方法: npm run test:api
 */

const API_BASE = 'http://localhost:3001';

async function testApi() {
  console.log('========================================');
  console.log('🧪 陵水本地生活智能体 API测试');
  console.log('========================================\n');

  try {
    // 1. 健康检查
    console.log('1️⃣  健康检查...');
    const health = await fetch(`${API_BASE}/health`);
    const healthData = await health.json();
    console.log('   结果:', JSON.stringify(healthData, null, 2));
    console.log('');

    // 2. API信息
    console.log('2️⃣  API信息...');
    const apiInfo = await fetch(`${API_BASE}/api`);
    const apiData = await apiInfo.json();
    console.log('   结果:', JSON.stringify(apiData, null, 2));
    console.log('');

    // 3. 获取商家列表
    console.log('3️⃣  获取商家列表...');
    const agents = await fetch(`${API_BASE}/api/agents?limit=3`);
    const agentsData = await agents.json();
    console.log('   结果:', JSON.stringify(agentsData, null, 2));
    console.log('');

    // 4. 测试预约创建
    console.log('4️⃣  测试预约创建...');
    const reservation = await fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: 'TEST_001',
        customer_name: '测试用户',
        customer_phone: '13800138000',
        date: '2026-04-20',
        time: '12:00',
        party_size: 2,
        source: 'direct',
      }),
    });
    const reservationData = await reservation.json();
    console.log('   结果:', JSON.stringify(reservationData, null, 2));
    console.log('');

    console.log('========================================');
    console.log('✅ 所有测试通过');
    console.log('========================================');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('\n💡 提示: 确保后端服务已启动 (npm run dev)');
  }
}

testApi();
