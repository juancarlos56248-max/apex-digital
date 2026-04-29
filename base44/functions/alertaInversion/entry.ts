import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    if (!data || !data.user_email) {
      return Response.json({ ok: false, reason: "no data" });
    }

    const statusLabels = {
      active: "Activa",
      completed: "Completada",
      cancelled: "Cancelada",
    };

    const tierLabels = {
      starter: "Apex Starter",
      advance: "Apex Advance",
      elite: "Apex Elite",
      institutional: "Apex Institutional",
    };

    const newStatus = data.status;
    const oldStatus = old_data?.status;
    const tier = tierLabels[data.tier] || data.tier;
    const amount = data.amount?.toLocaleString("es-PE") || "0";

    let subject = "";
    let statusLine = "";
    let color = "#c5a059";
    let emoji = "📊";

    if (event?.type === "create") {
      subject = `✅ Tu inversión en ${tier} ha sido activada`;
      statusLine = "Tu contrato de inversión ha sido <strong style='color:#26d9a8'>activado exitosamente</strong>.";
      color = "#26d9a8";
      emoji = "✅";
    } else if (event?.type === "update" && newStatus !== oldStatus) {
      if (newStatus === "completed") {
        subject = `🏁 Tu inversión en ${tier} ha sido completada`;
        statusLine = "Tu contrato de inversión ha sido <strong style='color:#26d9a8'>completado</strong>. ¡Felicidades por tus ganancias!";
        color = "#26d9a8";
        emoji = "🏁";
      } else if (newStatus === "cancelled") {
        subject = `⚠️ Tu inversión en ${tier} fue cancelada`;
        statusLine = "Tu contrato de inversión ha sido <strong style='color:#f04c5a'>cancelado</strong>.";
        color = "#f04c5a";
        emoji = "⚠️";
      } else {
        return Response.json({ ok: true, reason: "no relevant status change" });
      }
    } else {
      return Response.json({ ok: true, reason: "not a relevant event" });
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#111,#0d0d0d);padding:32px 32px 24px;border-bottom:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;color:#666;text-transform:uppercase;">Apex Digital</p>
      <h1 style="margin:0;font-size:22px;color:#c5a059;font-weight:700;">${emoji} Actualización de Inversión</h1>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">Hola,</p>
      <p style="color:#ddd;font-size:14px;line-height:1.7;margin:0 0 24px;">${statusLine}</p>

      <!-- Details card -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Plan</td>
            <td style="padding:6px 0;color:#c5a059;font-size:12px;font-weight:700;text-align:right;">${tier}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Monto</td>
            <td style="padding:6px 0;color:#e8e8e8;font-size:12px;font-weight:700;font-family:monospace;text-align:right;">$${amount} USDT</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Estado</td>
            <td style="padding:6px 0;font-size:12px;font-weight:700;text-align:right;color:${color};">${statusLabels[newStatus] || newStatus}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Fecha</td>
            <td style="padding:6px 0;color:#aaa;font-size:12px;text-align:right;">${new Date().toLocaleDateString("es-PE", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" })}</td>
          </tr>
        </table>
      </div>

      <p style="color:#555;font-size:11px;line-height:1.6;margin:0;">
        Si no reconoces esta actividad, contacta inmediatamente al soporte de Apex Digital.<br>
        Este es un mensaje automático, por favor no respondas a este correo.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#070707;padding:16px 32px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0;font-size:10px;color:#333;letter-spacing:2px;text-transform:uppercase;">Apex Digital Asset Management</p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: data.user_email,
      subject,
      body: html,
    });

    return Response.json({ ok: true, sent_to: data.user_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});