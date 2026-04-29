import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    if (!data || data.type !== "withdrawal" || !data.user_email) {
      return Response.json({ ok: false, reason: "not a withdrawal" });
    }

    const newStatus = data.status;
    const oldStatus = old_data?.status;

    // Only notify on meaningful status transitions
    if (event?.type === "update" && newStatus === oldStatus) {
      return Response.json({ ok: true, reason: "status unchanged" });
    }

    const amount = data.amount?.toLocaleString("es-PE") || "0";
    const wallet = data.wallet_address
      ? `${data.wallet_address.slice(0, 8)}...${data.wallet_address.slice(-6)}`
      : "—";
    const network = data.network || "—";

    let subject = "";
    let statusLine = "";
    let color = "#c5a059";
    let emoji = "💸";

    if (event?.type === "create" || (event?.type === "update" && newStatus === "pending")) {
      subject = `📥 Solicitud de retiro recibida — $${amount} USDT`;
      statusLine = "Tu solicitud de retiro ha sido <strong style='color:#c5a059'>recibida y está en revisión</strong>. Te notificaremos cuando sea procesada.";
      color = "#c5a059";
      emoji = "📥";
    } else if (newStatus === "approved") {
      subject = `✅ Tu retiro de $${amount} USDT ha sido aprobado`;
      statusLine = "Tu retiro ha sido <strong style='color:#26d9a8'>aprobado y procesado</strong>. Los fondos serán enviados a tu billetera en breve.";
      color = "#26d9a8";
      emoji = "✅";
    } else if (newStatus === "rejected") {
      subject = `❌ Tu retiro de $${amount} USDT fue rechazado`;
      statusLine = "Tu solicitud de retiro ha sido <strong style='color:#f04c5a'>rechazada</strong>. El monto ha sido devuelto a tu balance disponible.";
      color = "#f04c5a";
      emoji = "❌";
    } else {
      return Response.json({ ok: true, reason: "no relevant status" });
    }

    const statusLabels = {
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      completed: "Completado",
    };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#111,#0d0d0d);padding:32px 32px 24px;border-bottom:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;color:#666;text-transform:uppercase;">Apex Digital</p>
      <h1 style="margin:0;font-size:22px;color:#c5a059;font-weight:700;">${emoji} Actualización de Retiro</h1>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">Hola,</p>
      <p style="color:#ddd;font-size:14px;line-height:1.7;margin:0 0 24px;">${statusLine}</p>

      <!-- Details card -->
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Monto</td>
            <td style="padding:6px 0;color:#e8e8e8;font-size:13px;font-weight:700;font-family:monospace;text-align:right;">$${amount} USDT</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Red</td>
            <td style="padding:6px 0;color:#aaa;font-size:12px;text-align:right;">${network}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#666;font-size:12px;">Billetera</td>
            <td style="padding:6px 0;color:#aaa;font-size:12px;font-family:monospace;text-align:right;">${wallet}</td>
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