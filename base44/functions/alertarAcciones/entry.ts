import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Precio base y objetivo de cada acción (deben coincidir con Market.jsx)
const STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", base: 5.20, target: 9.36 },
  { symbol: "MSFT", name: "Microsoft Corp.", base: 6.80, target: 8.50 },
  { symbol: "TSLA", name: "Tesla Inc.", base: 3.40, target: 6.12 },
  { symbol: "NVDA", name: "NVIDIA Corp.", base: 7.50, target: 9.20 },
  { symbol: "AMZN", name: "Amazon.com", base: 4.90, target: 8.82 },
  { symbol: "GOOGL", name: "Alphabet Inc.", base: 6.10, target: 7.30 },
  { symbol: "META", name: "Meta Platforms", base: 5.70, target: 10.26 },
  { symbol: "JPM", name: "JPMorgan Chase", base: 3.80, target: 4.60 },
  { symbol: "GS", name: "Goldman Sachs", base: 8.30, target: 9.80 },
  { symbol: "NFLX", name: "Netflix Inc.", base: 4.20, target: 7.56 },
  { symbol: "AMD", name: "Advanced Micro Devices", base: 3.10, target: 3.90 },
  { symbol: "BRK.B", name: "Berkshire Hathaway", base: 7.90, target: 9.50 },
  { symbol: "DIS", name: "Walt Disney Co.", base: 2.80, target: 5.04 },
  { symbol: "UBER", name: "Uber Technologies", base: 4.60, target: 5.70 },
  { symbol: "COIN", name: "Coinbase Global", base: 6.40, target: 11.52 },
  { symbol: "PLTR", name: "Palantir Technologies", base: 3.60, target: 4.50 },
];

// Alertar cuando el precio supere estos % de ganancia desde la base
const ALERT_THRESHOLDS = [10, 25, 50, 75, 100];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Leer precios actuales almacenados (en User data de un "bot" o simplemente estimamos)
  // Como los precios son simulados en el frontend, estimamos el precio actual
  // basándonos en el tiempo transcurrido desde el inicio del día
  const now = new Date();
  const secondsToday = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
  const dayProgress = secondsToday / 86400; // 0 a 1

  // Obtener todos los usuarios para enviarles alertas
  const users = await base44.asServiceRole.entities.User.list();

  let emailsSent = 0;
  const alerts = [];

  for (const stock of STOCKS) {
    // Precio estimado actual: sube linealmente de base a target durante el día
    const estimatedPrice = stock.base + (stock.target - stock.base) * dayProgress;
    const changePct = ((estimatedPrice - stock.base) / stock.base) * 100;

    // Ver si cruzó algún umbral
    for (const threshold of ALERT_THRESHOLDS) {
      if (changePct >= threshold && changePct < threshold + 5) {
        alerts.push({ stock, estimatedPrice, changePct, threshold });
        break;
      }
    }
  }

  if (alerts.length === 0) {
    return Response.json({ ok: true, emailsSent: 0, message: "No hay umbrales cruzados en este momento" });
  }

  // Construir resumen de alertas para el email
  const alertRows = alerts.map(a =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:monospace;color:#c5a059;font-weight:bold;">${a.stock.symbol}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;color:#eee;">${a.stock.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:monospace;color:#e8c97a;">$${a.estimatedPrice.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;color:#4ade80;font-weight:bold;">+${a.changePct.toFixed(1)}%</td>
    </tr>`
  ).join("");

  const emailBody = `
    <div style="background:#050505;padding:32px;font-family:Inter,sans-serif;max-width:600px;margin:auto;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);padding:10px 24px;border-radius:8px;">
          <span style="color:#000;font-weight:900;font-size:18px;letter-spacing:2px;">APEX DIGITAL</span>
        </div>
      </div>
      <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:24px;">
        <h2 style="color:#e8c97a;font-size:16px;margin-bottom:4px;">📈 Alerta de Mercado</h2>
        <p style="color:#888;font-size:13px;margin-bottom:20px;">Las siguientes acciones han alcanzado nuevos máximos en tu plataforma:</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#111;">
              <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Símbolo</th>
              <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Empresa</th>
              <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Precio</th>
              <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Cambio</th>
            </tr>
          </thead>
          <tbody>${alertRows}</tbody>
        </table>
        <div style="margin-top:20px;padding:12px;background:#0d1a0d;border:1px solid #1a3a1a;border-radius:8px;">
          <p style="color:#4ade80;font-size:12px;margin:0;">💡 Es el momento ideal para revisar tu portafolio y aprovechar el movimiento del mercado.</p>
        </div>
      </div>
      <p style="color:#444;font-size:11px;text-align:center;margin-top:20px;">© 2026 Apex Digital · Singapore Division</p>
    </div>
  `;

  // Enviar email a todos los usuarios
  for (const user of users) {
    if (!user.email) continue;
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: `📈 Alerta Apex: ${alerts.length} acción(es) en alza — ${alerts.map(a => a.stock.symbol).join(", ")}`,
      body: emailBody,
    });
    emailsSent++;
  }

  return Response.json({ ok: true, emailsSent, alerts: alerts.map(a => ({ symbol: a.stock.symbol, changePct: a.changePct.toFixed(1) })) });
});