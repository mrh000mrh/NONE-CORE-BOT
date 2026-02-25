'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [botStatus, setBotStatus] = useState<'loading' | 'online' | 'offline'>('loading')
  const [webhookInfo, setWebhookInfo] = useState<any>(null)

  useEffect(() => {
    async function checkBotStatus() {
      try {
        const response = await fetch('/api/bot?action=info')
        const data = await response.json()
        
        if (data.ok && data.info) {
          setBotStatus('online')
          setWebhookInfo(data.info)
        } else {
          setBotStatus('offline')
        }
      } catch {
        setBotStatus('offline')
      }
    }
    
    checkBotStatus()
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          🤖 ربات کانفیگ تلگرام
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
          @nonecorebot
        </p>
      </div>

      {/* Status Card */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          📊 وضعیت ربات
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: botStatus === 'online' ? '#22c55e' : 
                        botStatus === 'offline' ? '#ef4444' : '#f59e0b',
            animation: 'pulse 2s infinite'
          }}></span>
          <span>
            {botStatus === 'online' ? 'آنلاین' : 
             botStatus === 'offline' ? 'آفلاین' : 'در حال بررسی...'}
          </span>
        </div>

        {webhookInfo && (
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            <p>URL: {webhookInfo.url || 'تنظیم نشده'}</p>
            <p>Pending Updates: {webhookInfo.pending_update_count || 0}</p>
          </div>
        )}
      </div>

      {/* Features */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          ✨ قابلیت‌ها
        </h2>
        
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
          <li>📥 استخراج کانفیگ از HTML، متن، لینک ساب</li>
          <li>🔧 پشتیبانی از VLESS, VMess, Trojan, SS, SSR, Tuic, Hysteria2</li>
          <li>🌍 تشخیص خودکار کشور از متن و GeoIP</li>
          <li>🏷️ ریمارک اختصاصی روی هر کانفیگ</li>
          <li>📊 جلوگیری از ارسال تکراری</li>
          <li>📤 ارسال خودکار به کانال تلگرام</li>
        </ul>
      </div>

      {/* Setup Guide */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          ⚙️ راه‌اندازی
        </h2>
        
        <ol style={{ padding: '0 1rem', display: 'grid', gap: '0.75rem' }}>
          <li>متغیرهای محیطی را در Railway تنظیم کنید</li>
          <li>به آدرس <code>/api/bot?action=set</code> بروید</li>
          <li>ربات را در کانال ادمین کنید</li>
          <li>از ربات استفاده کنید! 🚀</li>
        </ol>
      </div>

      {/* Variables */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '1rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
          🔐 متغیرهای محیطی
        </h2>
        
        <pre style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '1rem',
          borderRadius: '0.5rem',
          overflow: 'auto',
          fontSize: '0.85rem'
        }}>
{`BOT_TOKEN=your_bot_token
ADMIN_ID=your_telegram_id
CHANNEL_ID=-1001234567890
BOT_USERNAME=nonecorebot
DATABASE_URL=file:./db/custom.db`}
        </pre>
      </div>

      {/* Footer */}
      <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>
        Built with Next.js + Telegraf
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
