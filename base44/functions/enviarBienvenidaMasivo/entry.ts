import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    let sent = 0;
    let failed = 0;

    for (const u of users) {
      if (!u.email) continue;
      try {
        const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#050505;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#111,#0d0d0d);padding:36px 32px 28px;border-bottom:1px solid #1e1e1e;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:5px;color:#666;text-transform:uppercase;">Apex Digital</p>
      <h1 style="margin:0;font-size:24px;color:#c5a059;font-weight:800;">Bienvenido a APEX</h1>
      <p style="margin:8px 0 0;font-size:12px;color:#555;letter-spacing:2px;text-transform:uppercase;">Sistema de Gestión de Activos Digitales</p>
    </div>
    <div style="padding:36px 32px;">
      <p style="color:#aaa;font-size:14px;line-height:1.8;margin:0 0 8px;">Hola ${u.full_name || "Inversor"},</p>
      <p style="color:#ddd;font-size:14px;line-height:1.8;margin:0 0 28px;">
        Tu cuenta ha sido creada exitosamente. A continuación te explicamos cómo funciona nuestra plataforma y qué hacemos con tu inversión.
      </p>
      <div style="background:#0f0f0f;border:1px solid #1e1e1e;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#c5a059;letter-spacing:1px;">📊 ¿Cómo trabaja APEX con su inversión?</p>
        <p style="margin:0 0 16px;color:#bbb;font-size:13px;line-height:1.8;">
          En APEX, la inversión de cada usuario forma parte de un sistema de gestión conjunta orientado a participar en los mercados financieros, principalmente en la compra y venta de acciones.<br><br>
          El objetivo es identificar oportunidades que permitan generar rendimientos en función del comportamiento del mercado.
        </p>
      </div>
      <div style="background:#0f0f0f;border:1px solid #1e1e1e;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 20px;font-size:13px;font-weight:700;color:#c5a059;letter-spacing:1px;">🔎 ¿Qué se hace con su inversión?</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 12px 10px 0;vertical-align:top;width:28px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">1</div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Recepción de fondos</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">El usuario realiza un depósito desde montos accesibles, el cual se integra al capital gestionado por la plataforma.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px 10px 0;vertical-align:top;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">2</div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Distribución estratégica</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">Los fondos son asignados a distintos activos financieros, buscando diversificación y mejores oportunidades de rendimiento.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px 10px 0;vertical-align:top;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">3</div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Operaciones en el mercado</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">Se ejecutan compras y ventas de acciones basadas en análisis de mercado, tendencias y condiciones económicas.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px 10px 0;vertical-align:top;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">4</div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Gestión y monitoreo</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">Las operaciones son supervisadas continuamente para ajustar estrategias según el comportamiento del mercado.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px 10px 0;vertical-align:top;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">5</div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Generación de resultados</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">Dependiendo del desempeño de las inversiones, se obtienen resultados que pueden ser positivos o variables.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px 10px 0;vertical-align:top;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">6</div>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Asignación de ganancias</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">Los resultados se reflejan en la cuenta del usuario de acuerdo a su participación dentro del sistema.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px 0 0;vertical-align:top;">
              <div style="width:24px;height:24px;border-radius:50%;background:#c5a059;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:24px;">7</div>
            </td>
            <td style="padding:10px 0 0;">
              <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#e8e8e8;">Disponibilidad de fondos</p>
              <p style="margin:0;font-size:12px;color:#777;line-height:1.6;">El usuario puede solicitar retiros según las condiciones establecidas por la plataforma.</p>
            </td>
          </tr>
        </table>
      </div>
      <div style="background:linear-gradient(135deg,rgba(197,160,89,0.08),transparent);border:1px solid rgba(197,160,89,0.2);border-radius:12px;padding:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:14px;color:#c5a059;font-weight:700;">📈 APEX busca ofrecer un sistema accesible</p>
        <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">donde los usuarios puedan participar en el mercado sin necesidad de conocimientos avanzados, contando con herramientas de seguimiento dentro de la plataforma.</p>
      </div>
      <p style="color:#444;font-size:11px;line-height:1.6;margin:24px 0 0;text-align:center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
    <div style="background:#070707;padding:18px 32px;border-top:1px solid #1a1a1a;text-align:center;">
      <p style="margin:0;font-size:10px;color:#333;letter-spacing:3px;text-transform:uppercase;">Apex Digital Asset Management</p>
    </div>
  </div>
</body>
</html>`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: "🏦 Bienvenido a APEX Digital — Así funciona tu inversión",
          body: html,
          from_name: "APEX Digital",
        });
        sent++;
      } catch (e) {
        failed++;
      }
    }

    return Response.json({ ok: true, sent, failed, total: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});