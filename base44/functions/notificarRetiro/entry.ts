import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        const { data } = body;

        if (!data) {
            return Response.json({ error: 'No data provided' }, { status: 400 });
        }

        const userEmail = data.user_email;
        const amount = data.amount;
        const wallet = data.wallet_address || 'No especificada';
        const network = data.network || 'USDT';
        const date = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });

        // Enviar email al admin
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: 'apexdigitalfinance9@gmail.com',
            subject: `💸 Nueva Solicitud de Retiro — ${userEmail}`,
            body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #0a0a0a; color: #e0d5c0; border: 1px solid #c5a059; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #111, #1a1400); padding: 24px 32px; border-bottom: 1px solid #c5a059;">
    <h1 style="margin: 0; font-size: 20px; color: #c5a059; letter-spacing: 2px;">APEX DIGITAL</h1>
    <p style="margin: 4px 0 0; font-size: 11px; color: #888; letter-spacing: 4px;">NOTIFICACIÓN DE RETIRO</p>
  </div>
  <div style="padding: 28px 32px;">
    <h2 style="color: #e8c97a; font-size: 16px; margin-top: 0;">Nueva solicitud de retiro recibida</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Usuario</td>
        <td style="padding: 10px 0; color: #e0d5c0; border-bottom: 1px solid #222; text-align: right;"><strong>${userEmail}</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Monto solicitado</td>
        <td style="padding: 10px 0; color: #c5a059; border-bottom: 1px solid #222; text-align: right; font-size: 18px;"><strong>$${Number(amount).toFixed(2)} USDT</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Red</td>
        <td style="padding: 10px 0; color: #e0d5c0; border-bottom: 1px solid #222; text-align: right;">${network}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #888; border-bottom: 1px solid #222;">Wallet destino</td>
        <td style="padding: 10px 0; color: #e0d5c0; border-bottom: 1px solid #222; text-align: right; font-family: monospace; font-size: 12px;">${wallet}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; color: #888;">Fecha</td>
        <td style="padding: 10px 0; color: #e0d5c0; text-align: right;">${date}</td>
      </tr>
    </table>
    <div style="margin-top: 24px; padding: 16px; background: #111; border: 1px solid #c5a05930; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px; color: #888;">Accede al panel de administración para aprobar o rechazar esta solicitud.</p>
    </div>
  </div>
  <div style="padding: 16px 32px; background: #050505; border-top: 1px solid #1a1a1a; text-align: center;">
    <p style="margin: 0; font-size: 11px; color: #444; letter-spacing: 2px;">APEX DIGITAL ASSET MANAGEMENT — SINGAPORE DIVISION</p>
  </div>
</div>
            `,
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});