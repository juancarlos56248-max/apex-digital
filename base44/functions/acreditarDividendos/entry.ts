import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DAILY_RATES = {
  prueba: 0.3333,
  starter: 0.10,
  advance: 0.10,
  pro: 0.10,
  elite: 0.10,
  institutional: 0.10,
};

const PLAN_DURATION_DAYS = {
  prueba: 3,
  starter: 30,
  advance: 60,
  pro: 60,
  elite: 90,
  institutional: 120,
};

const STOCK_CONFIG = {
  aapl: { symbol: "AAPL", gainPctMin: 1.5, gainPctMax: 3,   lossPctMin: 0.5, lossPctMax: 1,   days: 3  },
  msft: { symbol: "MSFT", gainPctMin: 2.5, gainPctMax: 5,   lossPctMin: 1,   lossPctMax: 2,   days: 5  },
  nvda: { symbol: "NVDA", gainPctMin: 4,   gainPctMax: 8,   lossPctMin: 1.5, lossPctMax: 3,   days: 7  },
  amzn: { symbol: "AMZN", gainPctMin: 6,   gainPctMax: 12,  lossPctMin: 2,   lossPctMax: 4,   days: 9  },
  brkb: { symbol: "BRK.B", gainPctMin: 8,  gainPctMax: 15,  lossPctMin: 2.5, lossPctMax: 5,   days: 12 },
  jpm:  { symbol: "JPM",  gainPctMin: 8,   gainPctMax: 16,  lossPctMin: 2.5, lossPctMax: 5,   days: 13 },
  xom:  { symbol: "XOM",  gainPctMin: 14,  gainPctMax: 18,  lossPctMin: 2.5, lossPctMax: 5,   days: 15 },
};

const WIN_PROBABILITY = 0.6;

function randPct(min, max) {
  return min + Math.random() * (max - min);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();

    // Deltas acumulados por usuario: { balance: number, earned: number }
    // Usar esto para hacer UN SOLO update por usuario al final
    const userDeltas = {}; // email -> { balance, earned }
    const addDelta = (email, balanceDelta, earnedDelta) => {
      if (!userDeltas[email]) userDeltas[email] = { balance: 0, earned: 0 };
      userDeltas[email].balance += balanceDelta;
      userDeltas[email].earned += earnedDelta;
    };

    // ===== Inversiones (nodos de liquidez) =====
    const activeInvestments = await base44.asServiceRole.entities.Investment.filter({ status: "active" });
    let credited = 0;
    const completedIds = new Set();

    await Promise.all(activeInvestments.map(async (inv) => {
      const dailyRate = DAILY_RATES[inv.tier] || 0.10;
      const startedAt = new Date(inv.created_date);
      const lastDate = inv.last_dividend_date ? new Date(inv.last_dividend_date) : startedAt;
      const durationDays = PLAN_DURATION_DAYS[inv.tier] || 30;
      const expiresAt = new Date(startedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const creditUntil = now < expiresAt ? now : expiresAt;
      const hoursElapsed = Math.max(0, (creditUntil - lastDate) / (1000 * 60 * 60));
      const isExpired = now >= expiresAt;

      // Verificar si el usuario tiene rango mínimo personalizado y no lo cumple
      const userRecords = await base44.asServiceRole.entities.User.filter({ email: inv.user_email });
      const userRecord = userRecords[0];
      const tierMin = userRecord?.tier_ranges?.[inv.tier]?.min;
      if (tierMin && inv.amount < tierMin) {
        // Inversión parcial: no acreditar dividendos hasta completar el mínimo
        return;
      }

      if (hoursElapsed >= 24) {
        const cycles = Math.floor(hoursElapsed / 24);
        const dividend = parseFloat((inv.amount * dailyRate * cycles).toFixed(4));
        const creditedThrough = new Date(lastDate.getTime() + cycles * 24 * 60 * 60 * 1000);

        if (dividend > 0) {
          await Promise.all([
            base44.asServiceRole.entities.Investment.update(inv.id, {
              total_earned: parseFloat(((inv.total_earned || 0) + dividend).toFixed(4)),
              last_dividend_date: creditedThrough.toISOString(),
              ...(isExpired ? { status: "completed" } : {}),
            }),
            base44.asServiceRole.entities.Transaction.create({
              user_email: inv.user_email,
              type: "dividend",
              amount: dividend,
              status: "completed",
              notes: `Dividendo ${inv.tier} — ${cycles} ciclo(s) de 24h`,
            }),
          ]);
          addDelta(inv.user_email, dividend, dividend);
          credited++;
          completedIds.add(inv.id);
        }
      }

      if (isExpired && !completedIds.has(inv.id)) {
        completedIds.add(inv.id);
        await base44.asServiceRole.entities.Investment.update(inv.id, { status: "completed" });
      }
    }));

    // Sync total_invested para usuarios con inversiones completadas
    const affectedEmails = [...new Set(
      activeInvestments.filter(i => completedIds.has(i.id)).map(i => i.user_email)
    )];
    await Promise.all(affectedEmails.map(async (email) => {
      const remaining = await base44.asServiceRole.entities.Investment.filter({ user_email: email, status: "active" });
      const total = remaining.reduce((s, i) => s + (i.amount || 0), 0);
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (users[0]) await base44.asServiceRole.entities.User.update(users[0].id, { total_invested: total });
    }));

    // ===== Trading Positions =====
    const activePositions = await base44.asServiceRole.entities.TradingPosition.filter({ status: "active" });
    let tradingCredited = 0;

    await Promise.all(activePositions.map(async (pos) => {
      const cfg = STOCK_CONFIG[pos.plan];
      if (!cfg) return;

      const lastDate = pos.last_cycle_date ? new Date(pos.last_cycle_date) : new Date(pos.created_date);
      const hoursElapsed = (now - lastDate) / (1000 * 60 * 60);
      if (hoursElapsed < 24) return;

      const totalDays = pos.total_days || cfg.days;
      const cycleDay = pos.cycle_day || 1;
      const sessionsLeft = totalDays - (cycleDay - 1);
      if (sessionsLeft <= 0) {
        await base44.asServiceRole.entities.TradingPosition.update(pos.id, { status: "completed" });
        return;
      }

      const cyclesElapsed = Math.floor(hoursElapsed / 24);
      const sessions = Math.min(cyclesElapsed, sessionsLeft);

      const newResults = [...(pos.daily_results || [])];
      let totalGain = 0;
      for (let k = 0; k < sessions; k++) {
        const isWin = Math.random() < WIN_PROBABILITY;
        const pct = isWin
          ? randPct(cfg.gainPctMin, cfg.gainPctMax)
          : -randPct(cfg.lossPctMin, cfg.lossPctMax);
        const sessionResult = parseFloat((pos.amount * pct / 100).toFixed(2));
        newResults.push(sessionResult);
        totalGain += sessionResult;
      }
      totalGain = parseFloat(totalGain.toFixed(2));

      const newTotal = parseFloat(((pos.total_result || 0) + totalGain).toFixed(2));
      const newDay = cycleDay + sessions;
      const isCompleted = newDay > totalDays;
      const balanceDelta = isCompleted ? totalGain + pos.amount : totalGain;

      addDelta(pos.user_email, balanceDelta, totalGain);

      const ops = [
        base44.asServiceRole.entities.TradingPosition.update(pos.id, {
          cycle_day: newDay,
          total_result: newTotal,
          daily_results: newResults,
          last_cycle_date: now.toISOString(),
          ...(isCompleted ? { status: "completed" } : {}),
        }),
        base44.asServiceRole.entities.Transaction.create({
          user_email: pos.user_email,
          type: "dividend",
          amount: totalGain,
          status: "completed",
          notes: `Trading ${cfg.symbol} — ${sessions} sesión(es) — Resultado ${totalGain >= 0 ? "+" : ""}$${totalGain} USDT`,
        }),
      ];
      if (isCompleted) {
        ops.push(base44.asServiceRole.entities.Transaction.create({
          user_email: pos.user_email,
          type: "dividend",
          amount: pos.amount,
          status: "completed",
          notes: `Trading ${cfg.symbol} — Capital devuelto al completar ciclo de ${totalDays} días`,
        }));
      }
      await Promise.all(ops);
      tradingCredited++;
    }));

    // ===== Aplicar todos los deltas: leer balance FRESCO antes de actualizar =====
    const allEmails = Object.keys(userDeltas);
    await Promise.all(allEmails.map(async (email) => {
      const delta = userDeltas[email];
      if (!delta || (delta.balance === 0 && delta.earned === 0)) return;
      // Leer balance fresco para evitar race conditions con retiros concurrentes
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (!users[0]) return;
      const u = users[0];
      await base44.asServiceRole.entities.User.update(u.id, {
        balance: parseFloat(((u.balance || 0) + delta.balance).toFixed(4)),
        total_earned: parseFloat(((u.total_earned || 0) + delta.earned).toFixed(4)),
      });
    }));

    // ===== Notificaciones por email =====
    const notifyEmails = new Set([...Object.keys(userDeltas)]);

    await Promise.allSettled([...notifyEmails].map(async (email) => {
      const delta = userDeltas[email];
      if (!delta) return;

      const users = await base44.asServiceRole.entities.User.filter({ email });
      const u = users[0];
      if (!u?.email) return;

      const invDiv = activeInvestments
        .filter(i => completedIds.has(i.id) && i.user_email === email)
        .reduce((s, i) => s + parseFloat((i.amount * (DAILY_RATES[i.tier] || 0.10)).toFixed(4)), 0);
      const tradingResult = delta.earned - invDiv;
      const totalMovement = parseFloat(delta.earned.toFixed(2));
      const newBalance = parseFloat(((u.balance || 0) + delta.balance).toFixed(2));

      const isPositive = totalMovement >= 0;
      const icon = isPositive ? "📈" : "📉";
      const movColor = isPositive ? "#4ade80" : "#f87171";
      const movLabel = isPositive
        ? `+$${totalMovement.toFixed(2)} USDT`
        : `-$${Math.abs(totalMovement).toFixed(2)} USDT`;

      const rows = [];
      if (invDiv > 0) {
        rows.push(`<tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;color:#ccc;">💼 Nodos de Liquidez</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;font-family:monospace;font-weight:bold;color:#4ade80;text-align:right;">+$${invDiv.toFixed(2)}</td>
        </tr>`);
      }
      if (tradingResult !== 0) {
        const tc = tradingResult >= 0 ? "#4ade80" : "#f87171";
        const tl = tradingResult >= 0 ? `+$${tradingResult.toFixed(2)}` : `-$${Math.abs(tradingResult).toFixed(2)}`;
        rows.push(`<tr>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;color:#ccc;">📊 Trading de Acciones</td>
          <td style="padding:10px 14px;border-bottom:1px solid #1a1a1a;font-family:monospace;font-weight:bold;color:${tc};text-align:right;">${tl}</td>
        </tr>`);
      }

      if (rows.length === 0) return;

      const subject = isPositive
        ? `${icon} Tu balance subió ${movLabel} hoy — Apex Digital`
        : `${icon} Movimiento de mercado: ${movLabel} — Apex Digital`;

      const body = `<div style="background:#050505;padding:32px;font-family:Inter,sans-serif;max-width:600px;margin:auto;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);padding:10px 28px;border-radius:8px;">
            <span style="color:#000;font-weight:900;font-size:18px;letter-spacing:3px;">APEX DIGITAL</span>
          </div>
        </div>
        <div style="background:#0f0f0f;border:1px solid #222;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center;">
          <div style="font-size:36px;margin-bottom:10px;">${icon}</div>
          <h2 style="color:#e8c97a;font-size:17px;margin:0 0 6px 0;">Cierre de Ciclo Diario</h2>
          <p style="color:#888;font-size:13px;margin:0 0 18px 0;">Tu portafolio registró el siguiente movimiento:</p>
          <div style="display:inline-block;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:14px 28px;">
            <p style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Movimiento del día</p>
            <p style="color:${movColor};font-size:26px;font-weight:900;font-family:monospace;margin:0;">${movLabel}</p>
          </div>
        </div>
        <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#111;">
                <th style="padding:8px 14px;text-align:left;color:#555;font-size:10px;text-transform:uppercase;">Fuente</th>
                <th style="padding:8px 14px;text-align:right;color:#555;font-size:10px;text-transform:uppercase;">Resultado</th>
              </tr>
            </thead>
            <tbody>${rows.join("")}</tbody>
          </table>
        </div>
        <div style="background:#0a0a0a;border:1px solid #222;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="color:#555;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;">Balance actualizado</p>
          <p style="color:#e8c97a;font-size:22px;font-weight:900;font-family:monospace;margin:0;">$${newBalance.toFixed(2)} USDT</p>
        </div>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="https://apex-digital.base44.app/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#c5a059,#e8c97a);color:#000;font-weight:900;font-size:14px;padding:13px 30px;border-radius:10px;text-decoration:none;">
            Ver Dashboard →
          </a>
        </div>
        <p style="color:#333;font-size:11px;text-align:center;margin:0;">
          © 2026 Apex Digital · Singapore Division<br/>
          <span style="color:#222;">Este reporte se genera automáticamente tras el cierre de cada ciclo diario.</span>
        </p>
      </div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject, body });
    }));

    return Response.json({ ok: true, credited, tradingCredited, notified: notifyEmails.size, timestamp: now.toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});