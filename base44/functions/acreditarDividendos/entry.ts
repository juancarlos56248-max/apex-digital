import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DAILY_RATES = {
  starter: 0.10,
  advance: 0.10,
  pro: 0.10,
  elite: 0.10,
  institutional: 0.10
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow both scheduled (service role) and admin calls
  const activeInvestments = await base44.asServiceRole.entities.Investment.filter({ status: "active" });

  let credited = 0;
  const now = new Date();

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
        balance: (u.balance || 0) + dividend,
        total_earned: (u.total_earned || 0) + dividend,
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
  }

  return Response.json({ ok: true, credited, timestamp: now.toISOString() });
});