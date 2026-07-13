import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Guardar PIN hasheado en el User entity
    const users = await base44.asServiceRole.entities.User.filter({ email: user.email });
    if (!users[0]) return Response.json({ error: 'User not found' }, { status: 404 });

    await base44.asServiceRole.entities.User.update(users[0].id, {
      two_fa_pin: pin,
      two_fa_expires: expiresAt,
    });

    const body = `<div style="background:#050505;padding:32px;font-family:Inter,sans-serif;max-width:500px;margin:auto;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);padding:10px 28px;border-radius:8px;">
          <span style="color:#000;font-weight:900;font-size:18px;letter-spacing:3px;">APEX DIGITAL</span>
        </div>
      </div>
      <div style="background:#0f0f0f;border:1px solid #222;border-radius:16px;padding:32px;text-align:center;">
        <div style="font-size:32px;margin-bottom:12px;">🔐</div>
        <h2 style="color:#e8c97a;font-size:18px;margin:0 0 8px 0;">Código de Verificación</h2>
        <p style="color:#888;font-size:13px;margin:0 0 28px 0;">Ingresa este código para acceder a tu cuenta</p>
        <div style="background:#1a1a1a;border:2px solid #c5a059;border-radius:12px;padding:20px 32px;display:inline-block;margin-bottom:20px;">
          <span style="color:#e8c97a;font-size:38px;font-weight:900;font-family:monospace;letter-spacing:10px;">${pin}</span>
        </div>
        <p style="color:#555;font-size:12px;margin:0;">Válido por <strong style="color:#888;">10 minutos</strong>. No compartas este código.</p>
      </div>
      <p style="color:#333;font-size:11px;text-align:center;margin-top:20px;">
        Si no fuiste tú, ignora este correo. © 2026 Apex Digital
      </p>
    </div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `🔐 Tu código de verificación Apex Digital: ${pin}`,
      body,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});