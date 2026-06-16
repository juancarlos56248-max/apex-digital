import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const DAILY_RATES = {
  prueba: 0.3333,
  starter: 0.10,
  advance: 0.10,
  pro: 0.10,
  elite: 0.10,
  institutional: 0.10
};

// Duración en días de cada plan
const PLAN_DURATION_DAYS = {
  prueba: 3,
  starter: 30,
  advance: 60,
  pro: 60,
  elite: 90,
  institutional: 120,
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow both scheduled (service role) and admin calls
  const activeInvestments = await base44.asServiceRole.entities.Investment.filter({ status: "active" });

  let credited = 0;
  const now = new Date();
  const dividendProcessedIds = new Set();

  for (const inv of activeInvestments) {
    const dailyRate = DAILY_RATES[inv.tier] || 0.10;
    const lastDate = inv.last_dividend_date ? new Date(inv.last_dividend_date) : new Date(inv.created_date);
    const hoursElapsed = (now - lastDate) / (1000 * 60 * 60);

    // Only credit after 24 full hours
    if (hoursElapsed < 24) continue;

    const cycles = Math.floor(hoursElapsed / 24);
    const dividend = inv.amount * dailyRate * cycles;

    if (dividend <= 0) continue;

    // Update investment
    await base44.asServiceRole.entities.Investment.update(inv.id, {
      total_earned: (inv.total_earned || 0) + dividend,
      last_dividend_date: now.toISOString(),
    });

    // Credit user balance
    const users = await base44.asServiceRole.entities.User.filter({ email: inv.user_email });
    if (users.length > 0) {
      const u = users[0];
      await base44.asServiceRole.entities.User.update(u.id, {
        balance: parseFloat(((u.balance || 0) + dividend).toFixed(4)),
        total_earned: parseFloat(((u.total_earned || 0) + dividend).toFixed(4)),
      });
    }

    // Record transaction
    await base44.asServiceRole.entities.Transaction.create({
      user_email: inv.user_email,
      type: "dividend",
      amount: parseFloat(dividend.toFixed(4)),
      status: "completed",
      notes: `Dividendo ${inv.tier} — ${cycles} ciclo(s) de 24h`,
    });

    credited++;
    dividendProcessedIds.add(inv.id);

    // Verificar si el plan ya completó su ciclo
    const durationDays = PLAN_DURATION_DAYS[inv.tier] || 30;
    const startDate = new Date(inv.created_date);
    const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);

    if (daysElapsed >= durationDays) {
      await base44.asServiceRole.entities.Investment.update(inv.id, { status: "completed" });
      // Sync total_invested for this user after completion
      const remainingInvs = await base44.asServiceRole.entities.Investment.filter({ user_email: inv.user_email, status: "active" });
      const realTotal = remainingInvs.reduce((s, i) => s + (i.amount || 0), 0);
      const usersToSync = await base44.asServiceRole.entities.User.filter({ email: inv.user_email });
      if (usersToSync.length > 0) {
        await base44.asServiceRole.entities.User.update(usersToSync[0].id, { total_invested: realTotal });
      }
    }
  }

  // Marcar como completed inversiones vencidas que no tuvieron dividendo pendiente en este ciclo
  for (const inv of activeInvestments) {
    if (dividendProcessedIds.has(inv.id)) continue; // Ya fue procesada en el loop principal
    const durationDays = PLAN_DURATION_DAYS[inv.tier] || 30;
    const startDate = new Date(inv.created_date);
    const daysElapsed = (now - startDate) / (1000 * 60 * 60 * 24);
    if (daysElapsed >= durationDays) {
      dividendProcessedIds.add(inv.id);
      await base44.asServiceRole.entities.Investment.update(inv.id, { status: "completed" });
      const remainingInvs = await base44.asServiceRole.entities.Investment.filter({ user_email: inv.user_email, status: "active" });
      const realTotal = remainingInvs.reduce((s, i) => s + (i.amount || 0), 0);
      const usersToSync = await base44.asServiceRole.entities.User.filter({ email: inv.user_email });
      if (usersToSync.length > 0) {
        await base44.asServiceRole.entities.User.update(usersToSync[0].id, { total_invested: realTotal });
      }
    }
  }

  return Response.json({ ok: true, credited, timestamp: now.toISOString() });
});