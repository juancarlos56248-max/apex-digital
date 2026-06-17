import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const ticket = payload.data;
    if (!ticket || !ticket.id || !ticket.message) {
      return Response.json({ ok: true, skipped: "no ticket data" });
    }

    // Only process new open tickets (no reply yet)
    if (ticket.reply || ticket.status !== "open") {
      return Response.json({ ok: true, skipped: "already replied or not open" });
    }

    // Generate AI auto-reply
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Eres el asistente de soporte de APEX Digital, una plataforma de inversiones en criptomonedas. 
Un usuario llamado "${ticket.user_name || ticket.user_email}" escribió:
"${ticket.message}"

Responde de forma profesional, cálida y concisa en español. 
- Si pregunta sobre retiros: el tiempo es 24-72 horas hábiles, comisión del 8%, límite de 2 por día.
- Si pregunta sobre depósitos: se verifican manualmente en 1-6 horas hábiles.
- Si pregunta sobre inversiones: los dividendos se acreditan cada 24 horas.
- Si es urgente o requiere intervención humana: dile que un agente lo atenderá pronto.
- Máximo 3 oraciones. No uses emojis excesivos. Firma como "Equipo APEX Digital".`,
    });

    // Update ticket with auto-reply
    await base44.asServiceRole.entities.SupportTicket.update(ticket.id, {
      reply: aiResponse,
      status: "replied",
    });

    // Notify admin by email
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    for (const admin of adminUsers) {
      if (!admin.email) continue;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        from_name: "Apex Digital Soporte",
        subject: `💬 Nueva consulta de soporte — ${ticket.user_name || ticket.user_email}`,
        body: `<html><body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #333;border-radius:12px;padding:28px;">
    <h2 style="color:#c9a84c;margin-top:0;">Nueva Consulta de Soporte</h2>
    <p style="color:#aaa;font-size:13px;">Un usuario ha enviado un mensaje al chat de soporte.</p>
    <div style="background:#1a1a1a;border-left:3px solid #c9a84c;padding:14px;border-radius:6px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#c9a84c;font-weight:bold;">USUARIO</p>
      <p style="margin:0;font-size:14px;">${ticket.user_name || ""} &lt;${ticket.user_email}&gt;</p>
    </div>
    <div style="background:#1a1a1a;border-left:3px solid #555;padding:14px;border-radius:6px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#aaa;font-weight:bold;">MENSAJE</p>
      <p style="margin:0;font-size:14px;">${ticket.message}</p>
    </div>
    <div style="background:#1a1a1a;border-left:3px solid #4ade80;padding:14px;border-radius:6px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:12px;color:#4ade80;font-weight:bold;">RESPUESTA AUTOMÁTICA ENVIADA</p>
      <p style="margin:0;font-size:14px;color:#ccc;">${aiResponse}</p>
    </div>
    <p style="color:#666;font-size:12px;margin-top:24px;">Puedes responder manualmente desde el Panel de Administración → Soporte.</p>
  </div>
</body></html>`,
      });
    }

    return Response.json({ ok: true, replied: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});