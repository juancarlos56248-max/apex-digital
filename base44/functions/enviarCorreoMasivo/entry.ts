import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const users = await base44.asServiceRole.entities.User.list();

        let sent = 0;
        let failed = 0;

        for (const u of users) {
            if (!u.email) continue;
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: 'Apex Digital',
                    to: u.email,
                    subject: '📈 Mensaje Importante de Apex Digital — Oportunidad de Mercado',
                    body: `
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; background: #0a0a0a; color: #e0d5c0; border: 1px solid #c5a059; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #111, #1a1400); padding: 28px 32px; border-bottom: 1px solid #c5a059;">
    <h1 style="margin: 0; font-size: 22px; color: #c5a059; letter-spacing: 3px;">APEX DIGITAL</h1>
    <p style="margin: 4px 0 0; font-size: 11px; color: #888; letter-spacing: 4px;">COMUNICADO OFICIAL</p>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; line-height: 1.8; color: #d4b87a;">Estimado/a <strong>${u.full_name || 'usuario'}</strong>,</p>

    <p style="font-size: 14px; line-height: 1.9; color: #c8bfb0; margin-top: 16px;">
      Queremos expresar nuestro más sincero agradecimiento por haberse registrado en nuestra plataforma. Su confianza es fundamental para nosotros y nos motiva a seguir creciendo junto a ustedes.
    </p>

    <div style="margin: 24px 0; padding: 20px; background: #111; border-left: 3px solid #c5a059; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.9; color: #c8bfb0;">
        Nos complace informarles que actualmente el mercado presenta una <strong style="color: #4ade80;">tendencia al alza</strong>, y nuestras alertas indican que es un <strong style="color: #e8c97a;">buen momento para la compra de acciones</strong>. Como empresa, nos especializamos en la adquisición estratégica de acciones, buscando siempre maximizar las oportunidades de rentabilidad.
      </p>
    </div>

    <p style="font-size: 14px; line-height: 1.9; color: #c8bfb0;">
      Recordamos que nuestro modelo se basa en la <strong style="color: #c5a059;">participación conjunta</strong>: las ganancias obtenidas se distribuyen equitativamente entre nuestros usuarios, permitiendo que todos se beneficien del crecimiento y desempeño del mercado.
    </p>

    <p style="font-size: 14px; line-height: 1.9; color: #c8bfb0;">
      Seguiremos trabajando para ofrecerles información oportuna, análisis confiable y las mejores oportunidades de inversión.
    </p>

    <p style="font-size: 15px; color: #e8c97a; margin-top: 24px; font-weight: bold;">
      Gracias por ser parte de este proyecto.
    </p>

    <div style="margin-top: 28px; padding: 16px; background: #0f0f0f; border: 1px solid #c5a05930; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 13px; color: #888;">Accede a tu cuenta y aprovecha las oportunidades del mercado ahora.</p>
    </div>
  </div>
  <div style="padding: 16px 32px; background: #050505; border-top: 1px solid #1a1a1a; text-align: center;">
    <p style="margin: 0; font-size: 11px; color: #444; letter-spacing: 2px;">APEX DIGITAL ASSET MANAGEMENT — SINGAPORE DIVISION</p>
  </div>
</div>
                    `,
                });
                sent++;
            } catch {
                failed++;
            }
        }

        return Response.json({ success: true, sent, failed, total: users.length });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});