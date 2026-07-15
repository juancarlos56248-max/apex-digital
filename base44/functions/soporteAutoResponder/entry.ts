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

    // Usuarios excluidos del bot — atención manual únicamente
    const botExcluded = ["dominguezromeroj0@gmail.com"];
    if (botExcluded.includes(ticket.user_email)) {
      return Response.json({ ok: true, skipped: "user excluded from bot" });
    }

    // Generate AI auto-reply
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Eres el agente de soporte oficial de APEX Digital, una plataforma de gestión de activos digitales e inversiones institucionales con sede en Singapur.

El usuario "${ticket.user_name || ticket.user_email}" envió este mensaje:
"${ticket.message}"

INSTRUCCIONES ESTRICTAS:
1. Responde SOLO en español, de forma profesional, directa y empática.
2. Usa máximo 2-3 oraciones cortas. Sin listas ni bullets.
3. NO inventes información. Si no sabes la respuesta exacta, di que un agente lo revisará personalmente.
4. NO uses frases genéricas como "lamentamos los inconvenientes". Sé específico al tema del mensaje.
5. NO firmes ni uses emojis.

INFORMACIÓN OFICIAL DE LA PLATAFORMA:
- Depósitos: se procesan manualmente en 1-6 horas hábiles. Redes aceptadas: TRC20, ERC20, BEP20.
- Retiros: requieren 24-72 horas hábiles. Comisión de red: 8%. Máximo 1 retiro por ciclo de 24h.
- Dividendos: se acreditan automáticamente cada 24 horas en el balance disponible.
- Nodos de inversión: Starter (mín $10), Pro, Elite, Institutional. Pueden activarse múltiples nodos.
- Plan prueba: solo 1 uso por cuenta, monto fijo de $5, no es retirable.
- Bono de bienvenida ($5): no es retirable, solo para iniciar inversión.
- Referidos: comisión automática al activar primer nodo el referido.
- Seguridad: encriptación de extremo a extremo, monitoreo 24/7.
- Soporte disponible 7 días. Correo: soporte@pristineapex.pro

Si el tema es técnico, urgente o implica fondos bloqueados, indica que un agente humano revisará el caso en las próximas horas.`,
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