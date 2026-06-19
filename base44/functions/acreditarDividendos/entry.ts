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

// Trading stocks — must match STOCKS in pages/Trading
const STOCK_CONFIG = {
  aapl: { symbol: "AAPL", gainPct: 3,  days: 3 },
  msft: { symbol: "MSFT", gainPct: 5,  days: 5 },
  nvda: { symbol: "NVDA", gainPct: 8,  days: 7 },
  amzn: { symbol: "AMZN", gainPct: 12, days: 9 },
  brkb: { symbol: "BRK.B", gainPct: 15, days: 12 },
  jpm:  { symbol: "JPM",  gainPct: 16, days: 13 },
  xom:  { symbol: "XOM",  gainPct: 18, days: 15 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const activeInvestments = await base44.asServiceRole.entities.Investment.filter({ status: "active" });

    const now = new Date();
    let credited = 0;
    const completedIds = new Set();

    // Group investments by user to batch user lookups
    const userEmailSet = new Set(activeInvestments.map(i => i.user_email));
    const userMap = {};
    await Promise.all([...userEmailSet].map(async (email) => {
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (users.length > 0) userMap[email] = users[0];
    }));

    // Process dividends in parallel
    await Promise.all(activeInvestments.map(async (inv) => {
      const dailyRate = DAILY_RATES[inv.tier] || 0.10;
      const lastDate = inv.last_dividend_date ? new Date(inv.last_dividend_date) : new Date(inv.created_date);
      const hoursElapsed = (now - lastDate) / (1000 * 60 * 60);
      const durationDays = PLAN_DURATION_DAYS[inv.tier] || 30;
      const daysElapsed = (now - new Date(inv.created_date)) / (1000 * 60 * 60 * 24);
      const isExpired = daysElapsed >= durationDays;

      if (hoursElapsed >= 24) {
        const cycles = Math.floor(hoursElapsed / 24);
        const dividend = parseFloat((inv.amount * dailyRate * cycles).toFixed(4));

        if (dividend > 0) {
          const u = userMap[inv.user_email];
          await Promise.all([
            base44.asServiceRole.entities.Investment.update(inv.id, {
              total_earned: parseFloat(((inv.total_earned || 0) + dividend).toFixed(4)),
              last_dividend_date: now.toISOString(),
              ...(isExpired ? { status: "completed" } : {}),
            }),
            u ? base44.asServiceRole.entities.User.update(u.id, {
              balance: parseFloat(((u.balance || 0) + dividend).toFixed(4)),
              total_earned: parseFloat(((u.total_earned || 0) + dividend).toFixed(4)),
            }) : Promise.resolve(),
            base44.asServiceRole.entities.Transaction.create({
              user_email: inv.user_email,
              type: "dividend",
              amount: dividend,
              status: "completed",
              notes: `Dividendo ${inv.tier} — ${cycles} ciclo(s) de 24h`,
            }),
          ]);
          credited++;
          completedIds.add(inv.id);
        }
      }

      // Mark expired investments not yet processed
      if (isExpired && !completedIds.has(inv.id)) {
        completedIds.add(inv.id);
        await base44.asServiceRole.entities.Investment.update(inv.id, { status: "completed" });
      }
    }));

    // Sync total_invested for users with completed investments
    const affectedEmails = [...new Set(
      activeInvestments
        .filter(i => completedIds.has(i.id))
        .map(i => i.user_email)
    )];

    await Promise.all(affectedEmails.map(async (email) => {
      const remaining = await base44.asServiceRole.entities.Investment.filter({ user_email: email, status: "active" });
      const total = remaining.reduce((s, i) => s + (i.amount || 0), 0);
      const u = userMap[email];
      if (u) await base44.asServiceRole.entities.User.update(u.id, { total_invested: total });
    }));

    // ===== Trading Positions — acreditar ganancias automáticamente cada 24h =====
    const activePositions = await base44.asServiceRole.entities.TradingPosition.filter({ status: "active" });
    let tradingCredited = 0;
    // Acumular deltas por usuario para evitar condiciones de carrera (varias posiciones por usuario)
    const tradingDeltas = {}; // email -> { balance, earned }

    // Cargar usuarios faltantes
    const posEmails = [...new Set(activePositions.map(p => p.user_email))];
    await Promise.all(posEmails.map(async (email) => {
      if (!userMap[email]) {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (users.length > 0) userMap[email] = users[0];
      }
    }));

    // Procesar posiciones (solo TradingPosition + Transaction; los User.update se hacen al final)
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
      const dailyGain = parseFloat((pos.amount * cfg.gainPct / 100).toFixed(2));
      const totalGain = parseFloat((dailyGain * sessions).toFixed(2));

      const newResults = [...(pos.daily_results || [])];
      for (let k = 0; k < sessions; k++) newResults.push(dailyGain);
      const newTotal = parseFloat(((pos.total_result || 0) + totalGain).toFixed(2));
      const newDay = cycleDay + sessions;
      const isCompleted = newDay > totalDays;

      // Balance: ganancias diarias; al completar, también devuelve el capital
      const balanceDelta = isCompleted ? totalGain + pos.amount : totalGain;

      // Acumular delta por usuario
      const d = tradingDeltas[pos.user_email] || { balance: 0, earned: 0 };
      d.balance += balanceDelta;
      d.earned += totalGain;
      tradingDeltas[pos.user_email] = d;

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
          notes: `Trading ${cfg.symbol} — ${sessions} sesión(es) — Ganancia +$${totalGain} USDT`,
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

    // Aplicar los deltas acumulados a cada usuario una sola vez
    await Promise.all(Object.entries(tradingDeltas).map(async ([email, d]) => {
      const u = userMap[email];
      if (!u) return;
      await base44.asServiceRole.entities.User.update(u.id, {
        balance: parseFloat(((u.balance || 0) + d.balance).toFixed(2)),
        total_earned: parseFloat(((u.total_earned || 0) + d.earned).toFixed(2)),
      });
    }));

    return Response.json({ ok: true, credited, tradingCredited, timestamp: now.toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});