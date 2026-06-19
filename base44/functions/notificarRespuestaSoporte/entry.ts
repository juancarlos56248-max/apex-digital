import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const ticket = payload.data;
    const oldTicket = payload.old_data;

    // Solo notificar cuando se acaba de agregar una respuesta (antes no tenía reply)
    if (!ticket?.reply || oldTicket?.reply) {
      return Response.json({ ok: true, skipped: true });
    }

    const userEmail = ticket.user_email;
    const userName = ticket.user_name || userEmail;
    const firstName = userName.split(" ")[0];

    const subject = `✉️ El equipo APEX respondió tu mensaje`;

    const body = `<div style="background:#050505;padding:32px;font-family:Inter,sans-serif;max-width:600px;margin:auto;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);padding:10px 28px;border-radius:8px;">
          <span style="color:#000;font-weight:900;font-size:18px;letter-spacing:3px;">APEX DIGITAL</span>
        </div>
      </div>

      <div style="background:#0f0f0f;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:20px;">
        <p style="color:#888;font-size:13px;margin:0 0 16px 0;">Hola <strong style="color:#e8c97a;">${firstName}</strong>, el equipo de soporte APEX ha respondido tu consulta:</p>

        <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-left:3px solid #333;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
          <p style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 0;">Tu mensaje</p>
          <p style="color:#777;font-size:13px;margin:0;line-height:1.6;">${ticket.message}</p>
        </div>

        <div style="background:#0d1a0a;border:1px solid #1a2e14;border-left:3px solid #c5a059;border-radius:8px;padding:14px 16px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;display:flex;align-items:center;justify-content:center;">
              <span style="color:#000;font-size:11px;font-weight:900;">A</span>
            </div>
            <p style="color:#c5a059;font-size:11px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:1px;">Soporte APEX</p>
          </div>
          <p style="color:#eee;font-size:13px;margin:0;line-height:1.7;">${ticket.reply}</p>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://apex-digital.base44.app/soporte"
           style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);color:#000;font-weight:900;font-size:14px;padding:13px 30px;border-radius:10px;text-decoration:none;">
          Ver conversación →
        </a>
      </div>

      <p style="color:#333;font-size:11px;text-align:center;margin:0;">
        © 2026 Apex Digital · Singapore Division
      </p>
    </div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({ to: userEmail, subject, body });

    return Response.json({ ok: true, notified: userEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});