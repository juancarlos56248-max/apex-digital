import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const STOCK_NAMES = {
  aapl: "Apple Inc.",
  msft: "Microsoft Corp.",
  nvda: "NVIDIA Corp.",
  amzn: "Amazon.com Inc.",
  brkb: "Berkshire Hathaway",
  jpm: "JPMorgan Chase",
  xom: "Exxon Mobil",
};

const STOCK_SYMBOLS = {
  aapl: "AAPL", msft: "MSFT", nvda: "NVDA",
  amzn: "AMZN", brkb: "BRK.B", jpm: "JPM", xom: "XOM",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Obtener todas las posiciones activas
    const positions = await base44.asServiceRole.entities.TradingPosition.filter({ status: "active" });
    if (positions.length === 0) {
      return Response.json({ ok: true, emailsSent: 0, message: "Sin posiciones activas" });
    }

    // Agrupar posiciones por usuario
    const byUser = {};
    for (const pos of positions) {
      if (!byUser[pos.user_email]) byUser[pos.user_email] = [];
      byUser[pos.user_email].push(pos);
    }

    // Cargar usuarios
    const users = await base44.asServiceRole.entities.User.list();
    const userMap = {};
    for (const u of users) {
      if (u.email) userMap[u.email] = u;
    }

    let emailsSent = 0;

    await Promise.allSettled(
      Object.entries(byUser).map(async ([email, userPositions]) => {
        const user = userMap[email];
        if (!user) return;

        // Calcular resumen de las posiciones
        let totalGain = 0;
        let totalCapital = 0;
        const rows = userPositions.map(pos => {
          const symbol = STOCK_SYMBOLS[pos.plan] || pos.plan.toUpperCase();
          const name = STOCK_NAMES[pos.plan] || pos.plan;
          const result = pos.total_result || 0;
          const lastSession = pos.daily_results?.length > 0
            ? pos.daily_results[pos.daily_results.length - 1]
            : null;
          const cycleDay = pos.cycle_day || 1;
          const totalDays = pos.total_days || 7;
          totalGain += result;
          totalCapital += pos.amount || 0;

          const sessionColor = lastSession === null ? "#888"
            : lastSession >= 0 ? "#4ade80" : "#f87171";
          const sessionText = lastSession === null ? "—"
            : lastSession >= 0 ? `+$${lastSession.toFixed(2)}` : `-$${Math.abs(lastSession).toFixed(2)}`;
          const resultColor = result >= 0 ? "#4ade80" : "#f87171";

          return `<tr>
            <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;">
              <span style="font-family:monospace;font-weight:bold;color:#c5a059;">${symbol}</span><br/>
              <span style="font-size:11px;color:#666;">${name}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;font-family:monospace;color:#eee;">
              $${(pos.amount || 0).toLocaleString()}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;text-align:center;">
              <span style="font-size:11px;color:#888;">Día ${cycleDay - 1}/${totalDays}</span>
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;font-family:monospace;font-weight:bold;color:${sessionColor};text-align:right;">
              ${sessionText}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #1a1a1a;font-family:monospace;font-weight:bold;color:${resultColor};text-align:right;">
              ${result >= 0 ? "+" : ""}$${result.toFixed(2)}
            </td>
          </tr>`;
        }).join("");

        const isOverallPositive = totalGain >= 0;
        const balanceFormatted = (user.balance || 0).toFixed(2);
        const summaryColor = isOverallPositive ? "#4ade80" : "#f87171";
        const summaryIcon = isOverallPositive ? "📈" : "📉";
        const summaryText = isOverallPositive
          ? `Tu portafolio ganó <strong style="color:#4ade80;">+$${totalGain.toFixed(2)} USDT</strong> en las últimas sesiones.`
          : `Tu portafolio registró <strong style="color:#f87171;">-$${Math.abs(totalGain).toFixed(2)} USDT</strong> en las últimas sesiones. El mercado es volátil — tu capital permanece invertido.`;

        const emailBody = `<div style="background:#050505;padding:32px;font-family:Inter,sans-serif;max-width:620px;margin:auto;">
          <!-- Logo -->
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);padding:10px 28px;border-radius:8px;">
              <span style="color:#000;font-weight:900;font-size:18px;letter-spacing:3px;">APEX DIGITAL</span>
            </div>
          </div>

          <!-- Hero banner -->
          <div style="background:linear-gradient(135deg,#0f0f0f,#1a1a1a);border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">${summaryIcon}</div>
            <h2 style="color:#e8c97a;font-size:18px;margin:0 0 8px 0;">Reporte de Mercado</h2>
            <p style="color:#888;font-size:13px;margin:0 0 16px 0;">Actualización de tus posiciones de trading</p>
            <p style="color:#ccc;font-size:14px;margin:0;">${summaryText}</p>
          </div>

          <!-- Balance actual -->
          <div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:16px 24px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Balance actual</p>
              <p style="color:#e8c97a;font-size:22px;font-weight:900;font-family:monospace;margin:0;">$${balanceFormatted} USDT</p>
            </div>
            <div style="text-align:right;">
              <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">P&L total</p>
              <p style="color:${summaryColor};font-size:18px;font-weight:900;font-family:monospace;margin:0;">${totalGain >= 0 ? "+" : ""}$${totalGain.toFixed(2)}</p>
            </div>
          </div>

          <!-- Tabla de posiciones -->
          <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;margin-bottom:20px;">
            <div style="padding:14px 16px;border-bottom:1px solid #1a1a1a;">
              <h3 style="color:#eee;font-size:13px;margin:0;">Tus posiciones activas</h3>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#111;">
                  <th style="padding:8px 12px;text-align:left;color:#555;font-size:10px;text-transform:uppercase;">Acción</th>
                  <th style="padding:8px 12px;text-align:left;color:#555;font-size:10px;text-transform:uppercase;">Capital</th>
                  <th style="padding:8px 12px;text-align:center;color:#555;font-size:10px;text-transform:uppercase;">Ciclo</th>
                  <th style="padding:8px 12px;text-align:right;color:#555;font-size:10px;text-transform:uppercase;">Última sesión</th>
                  <th style="padding:8px 12px;text-align:right;color:#555;font-size:10px;text-transform:uppercase;">P&L total</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:24px;">
            <a href="https://apex-digital.base44.app/trading"
               style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);color:#000;font-weight:900;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
              Ver mis posiciones →
            </a>
          </div>

          <p style="color:#333;font-size:11px;text-align:center;margin:0;">
            © 2026 Apex Digital · Singapore Division<br/>
            <span style="color:#222;">Este es un reporte automático de tu actividad de trading.</span>
          </p>
        </div>`;

        const subject = isOverallPositive
          ? `${summaryIcon} Tus posiciones subieron +$${totalGain.toFixed(2)} USDT — Apex Digital`
          : `${summaryIcon} Actualización de mercado — Apex Digital`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject,
          body: emailBody,
        });
        emailsSent++;
      })
    );

    return Response.json({ ok: true, emailsSent, usersWithPositions: Object.keys(byUser).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});