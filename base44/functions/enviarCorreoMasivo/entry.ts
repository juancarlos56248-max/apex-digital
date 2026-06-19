import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const defaultBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#f0e8d5;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;font-weight:900;color:#c9a84c;letter-spacing:2px;margin:0;">APEX DIGITAL</h1>
      <p style="color:#888;font-size:12px;margin:4px 0 0;">Plataforma de Inversión & Trading</p>
    </div>

    <!-- Main card -->
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="font-size:18px;font-weight:700;color:#c9a84c;margin:0 0 8px;">🎉 ¡Bienvenidos nuevamente!</p>
      <p style="font-size:14px;color:#aaa;margin:0 0 24px;">Gracias por seguir confiando en nuestra plataforma. Queremos compartirles un breve resumen de cómo trabajamos y algunas novedades importantes.</p>

      <div style="border-left:3px solid #c9a84c;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">📊 Nuestro Modelo de Trabajo</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Nos especializamos en trading: la compra y venta estratégica de acciones en los mercados financieros globales. Contamos con un equipo de profesionales que analiza constantemente las mejores oportunidades de inversión.</p>
      </div>

      <div style="border-left:3px solid #34d399;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">💰 Su Capital, Nuestro Compromiso</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">El capital aportado por nuestros usuarios nos permite realizar operaciones de mayor volumen, aprovechando las oportunidades del mercado para generar rendimientos sostenibles.</p>
      </div>

      <div style="border-left:3px solid #60a5fa;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">📈 Distribución de Utilidades</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Las ganancias obtenidas de nuestras operaciones son distribuidas entre nuestros usuarios de acuerdo con las condiciones de la plataforma, de forma transparente y puntual.</p>
      </div>

      <div style="border-left:3px solid #a78bfa;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">🚀 Mejoras Continuas</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Estamos realizando mejoras continuas en nuestra plataforma para brindarles un servicio más eficiente, seguro y estable. Nuestro objetivo es optimizar la experiencia de todos y seguir creciendo juntos.</p>
      </div>

      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;text-align:center;margin-top:24px;">
        <p style="font-size:20px;margin:0 0 8px;">🤝</p>
        <p style="font-size:14px;font-weight:700;color:#c9a84c;margin:0 0 6px;">Gracias por su confianza</p>
        <p style="font-size:12px;color:#888;margin:0;line-height:1.6;">Seguiremos trabajando con compromiso y profesionalismo para ofrecerles las mejores oportunidades de crecimiento.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;border-top:1px solid #222;">
      <p style="font-size:11px;color:#555;margin:0;">© 2025 Apex Digital · soporte@pristineapex.pro</p>
      <p style="font-size:11px;color:#444;margin:4px 0 0;">Este es un correo oficial de la plataforma. Por favor no responda a este mensaje.</p>
    </div>
  </div>
</body>
</html>`;

    const { subject = '🎉 Novedades y Comunicado Oficial — Apex Digital', body: emailBody = defaultBody } = await req.json().catch(() => ({}));

    const users = await base44.asServiceRole.entities.User.list();
    const validUsers = users.filter(u => u.email);

    const results = await Promise.allSettled(
      validUsers.map(u =>
        base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Apex Digital',
          to: u.email,
          subject,
          body: emailBody,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return Response.json({ success: true, sent, failed, total: validUsers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});