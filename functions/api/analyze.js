export async function onRequestPost(context) {
  // context.request 包含了前端发来的请求
  // context.env 包含了我们在 Cloudflare 后台设置的环境变量
  const request = context.request;
  const env = context.env;

  try {
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '后端环境变量 GEMINI_API_KEY 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取前端传来的 JSON 数据
    const bodyText = await request.text();
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText 
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch(e) {
        return new Response(JSON.stringify({ error: `Google API 返回了异常内容: ${rawText}` }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error || data }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: `后端函数崩溃: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
