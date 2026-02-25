// Appwrite Function - ربات تلگرام کانفیگ
// مسیر: src/main.js

module.exports.main = async function (context) {
  const { req, res } = context;
  
  // تنظیمات
  const BOT_TOKEN = process.env.BOT_TOKEN || '';
  const ADMIN_ID = process.env.ADMIN_ID || '';
  const CHANNEL_ID = process.env.CHANNEL_ID || '';
  const BOT_USERNAME = process.env.BOT_USERNAME || 'nonecorebot';
  
  // GET request
  if (req.method === 'GET') {
    const url = new URL(req.url, 'https://example.com');
    const action = url.searchParams.get('action');
    
    // تنظیم webhook
    if (action === 'set') {
      const webhookUrl = req.url.split('?')[0];
      const result = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${webhookUrl}`, {
        method: 'POST'
      });
      const data = await result.json();
      
      return res.json({
        ok: true,
        message: 'Webhook تنظیم شد!',
        webhook_url: webhookUrl,
        result: data
      });
    }
    
    // اطلاعات webhook
    if (action === 'info') {
      const result = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
      const data = await result.json();
      return res.json({ ok: true, info: data });
    }
    
    // صفحه اصلی
    return res.json({
      ok: true,
      message: '🤖 ربات تلگرام فعال است!',
      bot: '@' + BOT_USERNAME,
      commands: {
        setWebhook: '?action=set',
        getInfo: '?action=info'
      }
    });
  }
  
  // POST request (Telegram)
  if (req.method === 'POST') {
    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {}
    
    const msg = body.message;
    if (msg && msg.chat && BOT_TOKEN) {
      const chatId = msg.chat.id;
      const text = msg.text || '';
      const userId = msg.from?.id?.toString();
      
      // بررسی ادمین
      if (userId !== ADMIN_ID) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '⛔ شما دسترسی ندارید.'
          })
        });
      } else if (text === '/start') {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `👋 سلام!

به ربات کانفیگ خوش آمدید.

دستورات:
/start - شروع
/stats - آمار
/send - ارسال به کانال

کانفیگ بفرستید تا پردازش شود.`
          })
        });
      } else if (text.includes('://')) {
        // استخراج کانفیگ
        const vless = text.match(/vless:\/\/[^\s]+/gi) || [];
        const vmess = text.match(/vmess:\/\/[A-Za-z0-9+/=]+/gi) || [];
        const trojan = text.match(/trojan:\/\/[^\s]+/gi) || [];
        const total = vless.length + vmess.length + trojan.length;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ ${total} کانفیگ یافت شد!\n\nVLESS: ${vless.length}\nVMess: ${vmess.length}\nTrojan: ${trojan.length}\n\n/use ${total} برای ارسال`
          })
        });
      } else {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'دستور نامعتبر. /start بزنید.'
          })
        });
      }
    }
    
    return res.json({ ok: true });
  }
  
  return res.json({ ok: true });
};
