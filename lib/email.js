
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function sendOTPEmail(email, otp, type = 'register', opts = {}) {
  // Opsi konfigurasi dengan fallback default
  const appName = opts.appName || process.env.NEXT_PUBLIC_APP_NAME || 'PremiumKita'
  const logoUrl = opts.logoUrl || '' // URL Logo aplikasi Anda
  const userName = opts.userName || 'Pengguna' // Nama user untuk sapaan
  const userAvatar = opts.userAvatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzErhy-EY42aTatfaYeBrOqj8M6QYyfXWA8HvAQJAEPQ&s=10' // PP default
  const primaryColor = opts.primaryColor || '#4f46e5' // Warna utama (Indigo)
  
  const isChangePw = type === 'change-password'

  // Subjek email dengan Emoji
  const subject = isChangePw
    ? `🔒 Kode OTP Ubah Kata Sandi — ${appName}`
    : `✨ Verifikasi Email Anda — ${appName}`

  // Render Logo jika ada
  const logoSection = logoUrl
    ? `<img src="${logoUrl}" alt="${appName}" style="height:40px;width:auto;object-fit:contain;margin-bottom:20px;display:block;margin-left:auto;margin-right:auto;" />`
    : `<div style="text-align:center; margin-bottom: 20px;"><span style="font-size:24px; font-weight:800; color:${primaryColor}; letter-spacing:-0.5px;">${appName}</span></div>`

  // Template HTML Email
  const html = `<!DOCTYPE html>
  <html lang="id">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e5e7eb; }
      .header { padding: 40px 32px 20px; text-align: center; }
      .avatar { width: 72px; height: 72px; border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); object-fit: cover; margin-bottom: 16px; }
      .body-content { padding: 0 40px 40px; text-align: center; }
      .title { color: #111827; margin: 0 0 12px; font-size: 22px; font-weight: 700; }
      .text { color: #4b5563; margin: 0 0 24px; font-size: 15px; line-height: 1.6; }
      .otp-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px 10px; margin-bottom: 28px; overflow-x: auto; }
      .otp-label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin: 0 0 12px; }
      .otp-code { color: ${primaryColor}; font-size: 34px; font-weight: 800; letter-spacing: 8px; margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: nowrap; }
      .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 24px; display: flex; align-items: flex-start; }
      .warning-text { color: #92400e; margin: 0; font-size: 13.5px; line-height: 1.5; }
      .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
      .footer-text { color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${logoSection}
        <img src="${userAvatar}" alt="Profile" class="avatar" />
      </div>
      
      <div class="body-content">
        <h2 class="title">Halo ${userName}! 👋</h2>
        <p class="text">
          ${isChangePw 
            ? 'Kami menerima permintaan untuk <strong>mengubah kata sandi</strong> akun Anda. Silakan gunakan kode verifikasi di bawah ini untuk melanjutkannya.' 
            : 'Terima kasih telah bergabung dengan kami! 🎉 <br>Untuk mulai menggunakan layanan kami, silakan <strong>aktifkan akun Anda</strong> dengan kode di bawah ini.'}
        </p>
        
        <div class="otp-box">
          <p class="otp-label">🔑 KODE RAHASIA ANDA</p>
          <p class="otp-code">${otp}</p>
        </div>
        
        <div class="warning-box">
          <p class="warning-text">
            <strong>⚠️ Peringatan Keamanan:</strong><br>
            Kode ini hanya berlaku selama <strong>10 menit</strong>. Jangan pernah membagikan kode ini kepada siapa pun, termasuk pihak yang mengaku sebagai staf ${appName}.
          </p>
        </div>
        
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          <em>Jika Anda tidak merasa melakukan permintaan ini, mohon abaikan email ini dan pastikan akun Anda aman.</em>
        </p>
      </div>
      
      <div class="footer">
        <p class="footer-text">
          Email ini dikirim secara otomatis oleh sistem.<br>
          © ${new Date().getFullYear()} ${appName}. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  </body>
  </html>`

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  })
}
