import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const subject = '🇵🇪 Feriado Nacional — Bono Especial: Deposita $300 y Recibe $1,000 en Nodos';

    const body = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#f0e8d5;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="font-size:28px;font-weight:900;color:#c9a84c;letter-spacing:2px;margin:0;">APEX DIGITAL</h1>
      <p style="color:#888;font-size:12px;margin:4px 0 0;">Plataforma de Inversión & Trading</p>
    </div>

    <!-- Feriado Banner -->
    <div style="background:linear-gradient(135deg,#1a0d00,#2a1500);border:1px solid #c9a84c44;border-radius:14px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="font-size:32px;margin:0 0 6px;">🇵🇪✈️</p>
      <p style="font-size:11px;font-weight:800;color:#c9a84c;letter-spacing:2px;margin:0 0 4px;text-transform:uppercase;">Jueves 23 de Julio · Feriado Nacional</p>
      <h2 style="font-size:22px;font-weight:900;color:#f0e8d5;margin:0 0 6px;line-height:1.3;">Día de la Fuerza Aérea del Perú</h2>
      <p style="font-size:13px;color:#aaa;margin:0;">Para celebrar esta fecha especial, APEX te premia con un bono exclusivo.</p>
    </div>

    <!-- Oferta principal -->
    <div style="background:#111;border:2px solid #c9a84c55;border-radius:16px;padding:32px;margin-bottom:24px;text-align:center;">
      <p style="font-size:13px;font-weight:700;color:#c9a84c;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">🎁 Bono por Feriado — Solo Hoy</p>

      <div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px 24px;">
          <p style="font-size:12px;color:#aaa;margin:0 0 4px;">Depositas</p>
          <p style="font-size:32px;font-weight:900;color:#60a5fa;margin:0;font-family:monospace;">$300</p>
          <p style="font-size:11px;color:#888;margin:4px 0 0;">USDT</p>
        </div>
        <div style="font-size:28px;color:#c9a84c;font-weight:900;">→</div>
        <div style="background:linear-gradient(135deg,#1a1200,#2a1e00);border:2px solid #c9a84c55;border-radius:12px;padding:16px 24px;">
          <p style="font-size:12px;color:#c9a84c;margin:0 0 4px;">Recibes en Nodos</p>
          <p style="font-size:32px;font-weight:900;color:#c9a84c;margin:0;font-family:monospace;">$1,000</p>
          <p style="font-size:11px;color:#a07830;margin:4px 0 0;">USDT activados</p>
        </div>
      </div>

      <div style="background:#1a1a00;border:1px solid #c9a84c30;border-radius:10px;padding:14px 20px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#fbbf24;margin:0 0 6px;">💡 ¿Cómo funciona?</p>
        <p style="font-size:12px;color:#aaa;margin:0;line-height:1.7;">Deposita mínimo <strong style="color:#f0e8d5;">$300 USDT</strong> hoy y tu cuenta será acreditada con <strong style="color:#c9a84c;">$1,000 USDT en nodos de inversión activos</strong>, generando rendimientos desde el primer día.</p>
      </div>

      <div style="background:#0d0d0d;border:1px solid #ff444433;border-radius:10px;padding:12px 20px;margin-bottom:24px;">
        <p style="font-size:12px;font-weight:800;color:#f87171;margin:0;">⚡ SOLO POR HOY — Jueves 23 de Julio 2026</p>
        <p style="font-size:11px;color:#aaa;margin:4px 0 0;">Esta oferta vence a las 11:59 PM (hora Perú)</p>
      </div>

      <a href="https://pristineapex.pro/deposit" style="display:inline-block;background:linear-gradient(135deg,#b45309,#c9a84c,#d97706);color:#000;font-weight:900;font-size:15px;padding:16px 44px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
        🚀 Depositar Ahora y Reclamar Bono
      </a>
    </div>

    <!-- Pasos -->
    <div style="background:#111;border:1px solid #222;border-radius:14px;padding:24px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 16px;">📋 Pasos para recibir tu bono:</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#c9a84c;color:#000;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">1</div>
          <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Inicia sesión en <strong style="color:#c9a84c;">pristineapex.pro</strong></p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#c9a84c;color:#000;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">2</div>
          <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Haz un depósito de <strong style="color:#f0e8d5;">mínimo $300 USDT</strong> en la sección Depósito</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#c9a84c;color:#000;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">3</div>
          <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Escribe en soporte: <em style="color:#60a5fa;">"Bono Feriado FAP"</em> adjuntando tu comprobante</p>
        </div>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:24px;height:24px;border-radius:50%;background:#c9a84c;color:#000;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">4</div>
          <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">¡Recibe tu acreditación de <strong style="color:#c9a84c;">$1,000 USDT en nodos</strong> activados!</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;border-top:1px solid #222;">
      <p style="font-size:12px;color:#666;margin:0;">¡Feliz Día de la Fuerza Aérea del Perú! 🇵🇪</p>
      <p style="font-size:11px;color:#555;margin:6px 0 0;">© 2026 Apex Digital · soporte@pristineapex.pro</p>
      <p style="font-size:11px;color:#444;margin:4px 0 0;">Oferta válida únicamente el 23 de julio de 2026. Sujeta a verificación de depósito.</p>
    </div>
  </div>
</body>
</html>`;

    const users = await base44.asServiceRole.entities.User.list();
    const validUsers = users.filter((u: any) => u.email);

    const results = await Promise.allSettled(
      validUsers.map((u: any) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Apex Digital',
          to: u.email,
          subject,
          body,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return Response.json({ success: true, sent, failed, total: validUsers.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});