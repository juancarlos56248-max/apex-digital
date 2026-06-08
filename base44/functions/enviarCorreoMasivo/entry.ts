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
                    subject: '📘 Cómo funciona APEX Digital — Guía completa para inversores',
                    body: `
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; background: #0a0a0a; color: #e0d5c0; border: 1px solid #c5a059; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #111, #1a1400); padding: 28px 32px; border-bottom: 1px solid #c5a059;">
    <h1 style="margin: 0; font-size: 22px; color: #c5a059; letter-spacing: 3px;">APEX DIGITAL</h1>
    <p style="margin: 4px 0 0; font-size: 11px; color: #888; letter-spacing: 4px;">GUÍA OFICIAL DE LA PLATAFORMA</p>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 15px; line-height: 1.8; color: #d4b87a;">Estimado/a <strong>${u.full_name || 'inversor'}</strong>,</p>

    <p style="font-size: 14px; line-height: 1.9; color: #c8bfb0; margin-top: 12px;">
      Queremos que conozcas exactamente cómo funciona APEX Digital para que puedas aprovechar al máximo tu participación. A continuación te explicamos el proceso paso a paso:
    </p>

    <!-- Paso 1 -->
    <div style="margin: 20px 0; padding: 18px 20px; background: #111; border-left: 3px solid #c5a059; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #c5a059; font-weight: bold; letter-spacing: 1px;">PASO 1 — Depósito de fondos</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #c8bfb0;">
        Realizas un depósito en USDT (TRC20, ERC20 o BEP20) desde <strong style="color: #e8c97a;">$5 USD</strong>. Ese capital ingresa al sistema de gestión conjunta de APEX.
      </p>
    </div>

    <!-- Paso 2 -->
    <div style="margin: 20px 0; padding: 18px 20px; background: #111; border-left: 3px solid #4ade80; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #4ade80; font-weight: bold; letter-spacing: 1px;">PASO 2 — Activación del nodo de inversión</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #c8bfb0;">
        Con tu saldo disponible, activas un <strong style="color: #e8c97a;">nodo de liquidez</strong> eligiendo el plan que corresponde a tu capital (Starter, Advance, Elite o Institutional). Tu dinero comienza a trabajar de inmediato.
      </p>
    </div>

    <!-- Paso 3 -->
    <div style="margin: 20px 0; padding: 18px 20px; background: #111; border-left: 3px solid #60a5fa; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #60a5fa; font-weight: bold; letter-spacing: 1px;">PASO 3 — Generación de rendimientos diarios</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #c8bfb0;">
        APEX ejecuta operaciones algorítmicas en los mercados financieros. Cada <strong style="color: #e8c97a;">24 horas</strong> se acredita automáticamente en tu cuenta un rendimiento del <strong style="color: #4ade80;">10% diario</strong> sobre tu capital invertido.
      </p>
    </div>

    <!-- Paso 4 -->
    <div style="margin: 20px 0; padding: 18px 20px; background: #111; border-left: 3px solid #a78bfa; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #a78bfa; font-weight: bold; letter-spacing: 1px;">PASO 4 — Retiro de ganancias</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #c8bfb0;">
        Puedes solicitar el retiro de tu saldo disponible en cualquier momento (una vez cada 24 horas). Los retiros se procesan en <strong style="color: #e8c97a;">24 a 72 horas hábiles</strong> con una comisión de red del 8%.
      </p>
    </div>

    <!-- Paso 5 -->
    <div style="margin: 20px 0; padding: 18px 20px; background: #111; border-left: 3px solid #fb923c; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #fb923c; font-weight: bold; letter-spacing: 1px;">PASO 5 — Programa de referidos</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #c8bfb0;">
        Comparte tu enlace de referido y gana comisiones por cada usuario que active un nodo de inversión. Tus ganancias se acreditan directamente en tu balance.
      </p>
    </div>

    <div style="margin: 28px 0 8px; padding: 20px; background: #0f0f0f; border: 1px solid #c5a05940; border-radius: 10px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #c5a059; font-weight: bold;">¿Listo para comenzar?</p>
      <p style="margin: 0; font-size: 13px; color: #888;">Ingresa a tu cuenta, activa tu nodo y empieza a generar rendimientos hoy mismo.</p>
    </div>

    <p style="font-size: 13px; color: #666; margin-top: 24px; line-height: 1.7;">
      Si tienes alguna consulta, puedes contactarnos directamente desde la sección de Soporte dentro de la plataforma. Estamos aquí para ayudarte.
    </p>
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