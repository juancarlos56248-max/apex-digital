import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Símbolos del trading engine — deben coincidir con STOCK_CONFIG en acreditarDividendos
const STOCK_CONFIG = {
  aapl: { symbol: "AAPL", name: "Apple Inc.",          gainPctMin: 1.5, gainPctMax: 3,   lossPctMin: 0.5, lossPctMax: 1   },
  msft: { symbol: "MSFT", name: "Microsoft Corp.",      gainPctMin: 2.5, gainPctMax: 5,   lossPctMin: 1,   lossPctMax: 2   },
  nvda: { symbol: "NVDA", name: "NVIDIA Corp.",         gainPctMin: 4,   gainPctMax: 8,   lossPctMin: 1.5, lossPctMax: 3   },
  amzn: { symbol: "AMZN", name: "Amazon.com",           gainPctMin: 6,   gainPctMax: 12,  lossPctMin: 2,   lossPctMax: 4   },
  brkb: { symbol: "BRK.B", name: "Berkshire Hathaway", gainPctMin: 8,   gainPctMax: 15,  lossPctMin: 2.5, lossPctMax: 5   },
  jpm:  { symbol: "JPM",  name: "JPMorgan Chase",       gainPctMin: 8,   gainPctMax: 16,  lossPctMin: 2.5, lossPctMax: 5   },
  xom:  { symbol: "XOM",  name: "ExxonMobil Corp.",     gainPctMin: 14,  gainPctMax: 18,  lossPctMin: 2.5, lossPctMax: 5   },
};

// Umbral de volatilidad intradiaria que dispara la alerta (como % del rango diario del activo)
const VOLATILITY_THRESHOLD_PCT = 40; // si el movimiento simulado supera el 40% del rango máximo diario

// Simula el movimiento actual del mercado basado en la hora del día
function getIntraday(cfg, now) {
  const secondsOfDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayPct = secondsOfDay / 86400;
  // Usa una curva sinusoidal para simular volatilidad intradiaria
  const wave = Math.sin(dayPct * Math.PI * 2) * 0.5 + 0.5; // 0..1
  const maxGain = cfg.gainPctMax;
  const maxLoss = cfg.lossPctMax;
  // Combina tendencia positiva (60%) y negativa (40%) con la curva
  const bias = 0.6;
  const currentMovePct = wave >= bias
    ? (wave - bias) / (1 - bias) * maxGain           // ganancia proporcional
    : -(( bias - wave) / bias) * maxLoss;             // pérdida proporcional
  return parseFloat(currentMovePct.toFixed(2));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();

    // Cargar posiciones activas y calcular movimiento intradiario por plan
    const activePositions = await base44.asServiceRole.entities.TradingPosition.filter({ status: "active" });
    if (activePositions.length === 0) {
      return Response.json({ ok: true, emailsSent: 0, message: "Sin posiciones activas" });
    }

    // Determinar qué plans tienen movimiento significativo ahora
    const significantMoves = {}; // planKey -> { symbol, name, movePct, isUp }
    for (const [planKey, cfg] of Object.entries(STOCK_CONFIG)) {
      const movePct = getIntraday(cfg, now);
      const maxRange = movePct >= 0 ? cfg.gainPctMax : cfg.lossPctMax;
      const relativeImpact = Math.abs(movePct) / maxRange * 100; // % del rango máximo
      if (relativeImpact >= VOLATILITY_THRESHOLD_PCT) {
        significantMoves[planKey] = {
          symbol: cfg.symbol,
          name: cfg.name,
          movePct,
          isUp: movePct >= 0,
        };
      }
    }

    if (Object.keys(significantMoves).length === 0) {
      return Response.json({ ok: true, emailsSent: 0, message: "Sin movimientos significativos en este momento" });
    }

    // Agrupar posiciones afectadas por usuario
    const userPositions = {}; // email -> [{ position, move }]
    for (const pos of activePositions) {
      const move = significantMoves[pos.plan];
      if (!move) continue;
      if (!userPositions[pos.user_email]) userPositions[pos.user_email] = [];
      userPositions[pos.user_email].push({ pos, move });
    }

    if (Object.keys(userPositions).length === 0) {
      return Response.json({ ok: true, emailsSent: 0, message: "Ningún usuario afectado por los movimientos" });
    }

    // Cargar datos de usuarios
    const userMap = {};
    const emails = Object.keys(userPositions);
    await Promise.all(emails.map(async (email) => {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (users.length > 0) userMap[email] = users[0];
    }));

    // Enviar email personalizado a cada usuario afectado
    let emailsSent = 0;
    await Promise.allSettled(emails.map(async (email) => {
      const u = userMap[email];
      if (!u?.email) return;

      const affected = userPositions[email];
      const hasUp = affected.some(a => a.move.isUp);
      const hasDown = affected.some(a => !a.move.isUp);
      const icon = hasUp && !hasDown ? "📈" : hasDown && !hasUp ? "📉" : "⚡";
      const subject = `${icon} Alerta de Mercado Apex — Movimiento en tus posiciones`;

      const rows = affected.map(({ pos, move }) => {
        const impact = parseFloat((pos.amount * Math.abs(move.movePct) / 100).toFixed(2));
        const color = move.isUp ? "#4ade80" : "#f87171";
        const sign = move.isUp ? "+" : "-";
        const direction = move.isUp ? "↑ ALZA" : "↓ BAJA";
        return `<tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;">
            <span style="font-family:monospace;font-weight:bold;color:#e8c97a;">${move.symbol}</span>
            <span style="color:#666;font-size:11px;margin-left:8px;">${move.name}</span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;font-family:monospace;color:#ccc;text-align:right;">$${pos.amount.toLocaleString()} USDT</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;font-family:monospace;font-weight:bold;color:${color};text-align:right;">${sign}${Math.abs(move.movePct).toFixed(2)}%</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;font-size:11px;font-weight:bold;color:${color};text-align:center;">${direction}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;font-family:monospace;color:${color};text-align:right;">${sign}$${impact}</td>
        </tr>`;
      }).join("");

      const totalImpact = affected.reduce((sum, { pos, move }) => {
        const impact = parseFloat((pos.amount * move.movePct / 100).toFixed(2));
        return sum + impact;
      }, 0);
      const impactColor = totalImpact >= 0 ? "#4ade80" : "#f87171";
      const impactLabel = totalImpact >= 0 ? `+$${totalImpact.toFixed(2)}` : `-$${Math.abs(totalImpact).toFixed(2)}`;

      const body = `<div style="background:#050505;padding:32px;font-family:Inter,sans-serif;max-width:620px;margin:auto;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);padding:10px 28px;border-radius:8px;">
            <span style="color:#000;font-weight:900;font-size:18px;letter-spacing:3px;">APEX DIGITAL</span>
          </div>
        </div>

        <div style="background:#0f0f0f;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">${icon}</div>
          <h2 style="color:#e8c97a;font-size:17px;margin:0 0 6px 0;">Movimiento Significativo Detectado</h2>
          <p style="color:#888;font-size:13px;margin:0;">El mercado está registrando volatilidad en tus activos en este momento.</p>
        </div>

        <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;margin-bottom:20px;">
          <div style="background:#111;padding:8px 14px;">
            <span style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Tus posiciones afectadas</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#0d0d0d;">
                <th style="padding:8px 14px;text-align:left;color:#555;font-size:10px;text-transform:uppercase;">Activo</th>
                <th style="padding:8px 14px;text-align:right;color:#555;font-size:10px;text-transform:uppercase;">Invertido</th>
                <th style="padding:8px 14px;text-align:right;color:#555;font-size:10px;text-transform:uppercase;">Movimiento</th>
                <th style="padding:8px 14px;text-align:center;color:#555;font-size:10px;text-transform:uppercase;">Dirección</th>
                <th style="padding:8px 14px;text-align:right;color:#555;font-size:10px;text-transform:uppercase;">Impacto est.</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Impacto estimado total</p>
            <p style="color:${impactColor};font-size:22px;font-weight:900;font-family:monospace;margin:0;">${impactLabel} USDT</p>
          </div>
          <div style="text-align:right;">
            <p style="color:#555;font-size:11px;margin:0 0 4px 0;">Posiciones activas</p>
            <p style="color:#e8c97a;font-size:18px;font-weight:bold;margin:0;">${affected.length}</p>
          </div>
        </div>

        <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
          <p style="color:#666;font-size:12px;margin:0 0 6px 0;">⚠️ <strong style="color:#888;">Aviso de riesgo:</strong></p>
          <p style="color:#555;font-size:11px;margin:0;line-height:1.6;">El impacto mostrado es una estimación intradiaria. Los resultados finales se calculan y acreditan al cierre del ciclo de 24h. Los mercados financieros son volátiles y los rendimientos pueden variar.</p>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="https://apex-digital.base44.app/trading"
             style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);color:#000;font-weight:900;font-size:14px;padding:13px 30px;border-radius:10px;text-decoration:none;">
            Ver Trading →
          </a>
        </div>

        <p style="color:#333;font-size:11px;text-align:center;margin:0;">
          © 2026 Apex Digital · Singapore Division<br/>
          <span style="color:#222;">Esta alerta se genera automáticamente cuando se detecta volatilidad significativa en tus activos.</span>
        </p>
      </div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject, body });
      emailsSent++;
    }));

    return Response.json({
      ok: true,
      emailsSent,
      significantMoves: Object.keys(significantMoves).map(k => ({
        plan: k,
        symbol: significantMoves[k].symbol,
        movePct: significantMoves[k].movePct,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});