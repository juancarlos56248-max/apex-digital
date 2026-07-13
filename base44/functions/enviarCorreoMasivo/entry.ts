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

    <!-- Alert banner -->
    <div style="background:linear-gradient(135deg,#0d1f0d,#0a1a0a);border:1px solid #22c55e44;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:24px;">🔒</span>
      <div>
        <p style="font-size:13px;font-weight:800;color:#4ade80;margin:0 0 2px;letter-spacing:0.5px;">ACTUALIZACIÓN DE SEGURIDAD</p>
        <p style="font-size:12px;color:#86efac;margin:0;">Hemos reforzado los protocolos de protección de su cuenta y fondos.</p>
      </div>
    </div>

    <!-- Main card -->
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="font-size:18px;font-weight:700;color:#c9a84c;margin:0 0 8px;">🛡️ Seguridad Mejorada en Apex Digital</p>
      <p style="font-size:14px;color:#aaa;margin:0 0 24px;line-height:1.7;">Estimado usuario, nos complace informarle que hemos implementado importantes mejoras en la seguridad de nuestra plataforma para garantizar la máxima protección de sus activos y datos personales.</p>

      <div style="border-left:3px solid #4ade80;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">🔐 Cifrado de Nivel Bancario</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Hemos actualizado nuestros protocolos de cifrado a estándar AES-256, el mismo nivel utilizado por los principales bancos internacionales, para proteger cada transacción.</p>
      </div>

      <div style="border-left:3px solid #60a5fa;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">🌐 Monitoreo 24/7 en Tiempo Real</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Nuestros sistemas de monitoreo ahora operan de forma continua, detectando y bloqueando automáticamente cualquier actividad sospechosa en su cuenta antes de que represente una amenaza.</p>
      </div>

      <div style="border-left:3px solid #a78bfa;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">✅ Verificación Reforzada de Retiros</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Todo retiro pasa ahora por un proceso de validación adicional para asegurar que solo usted pueda mover sus fondos. Su dinero está más protegido que nunca.</p>
      </div>

      <div style="border-left:3px solid #fb923c;padding-left:16px;margin-bottom:20px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">🚨 Sistema Anti-Fraude Avanzado</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Hemos integrado un sistema inteligente de detección de fraude que analiza patrones de comportamiento en tiempo real, protegiendo su inversión de accesos no autorizados.</p>
      </div>

      <div style="border-left:3px solid #c9a84c;padding-left:16px;margin-bottom:24px;">
        <p style="font-size:13px;font-weight:700;color:#f0e8d5;margin:0 0 4px;">🏦 Custodia Segregada de Fondos</p>
        <p style="font-size:13px;color:#aaa;margin:0;line-height:1.6;">Los fondos de todos nuestros usuarios se mantienen en cuentas segregadas y protegidas, completamente separadas de los activos operativos de la empresa.</p>
      </div>

      <!-- Tips de seguridad -->
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:20px;margin-bottom:0;">
        <p style="font-size:13px;font-weight:700;color:#fbbf24;margin:0 0 12px;">💡 Consejos para Proteger su Cuenta</p>
        <ul style="margin:0;padding-left:20px;font-size:12px;color:#aaa;line-height:2;">
          <li>Nunca comparta su contraseña o datos de acceso con nadie.</li>
          <li>Acceda siempre desde dispositivos de confianza.</li>
          <li>Verifique que la URL sea <strong style="color:#c9a84c;">pristineapex.pro</strong> antes de ingresar.</li>
          <li>Ante cualquier actividad sospechosa, contáctenos de inmediato.</li>
        </ul>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="https://pristineapex.pro/dashboard" style="display:inline-block;background:linear-gradient(135deg,#b45309,#c9a84c,#d97706);color:#000;font-weight:900;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
        Acceder a mi cuenta →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:16px;border-top:1px solid #222;">
      <p style="font-size:11px;color:#555;margin:0;">© 2026 Apex Digital · soporte@pristineapex.pro</p>
      <p style="font-size:11px;color:#444;margin:4px 0 0;">Este es un correo oficial de la plataforma. Por favor no responda a este mensaje.</p>
    </div>
  </div>
</body>
</html>`;

    const { subject = '🔒 Actualización de Seguridad — Apex Digital', body: emailBody = defaultBody } = await req.json().catch(() => ({}));

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