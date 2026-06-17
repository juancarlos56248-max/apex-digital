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

    return Response.json({ ok: true, credited, timestamp: now.toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});