import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { referral_code, tier, referred_email } = await req.json();

  if (!referral_code || !tier || !referred_email) {
    return Response.json({ error: 'Missing params' }, { status: 400 });
  }

  // Find referrer using service role (bypasses user security rules)
  const referrers = await base44.asServiceRole.entities.User.filter({ referral_code });
  if (referrers.length === 0) {
    return Response.json({ ok: false, reason: 'Referral code not found' });
  }

  const referrer = referrers[0];

  // Don't self-refer
  if (referrer.email === referred_email) {
    return Response.json({ ok: false, reason: 'Self referral' });
  }

  const bonusMap = { starter: 5, advance: 25, elite: 50, institutional: 100 };
  const bonus = bonusMap[tier] || 5;

  // Create referral record
  await base44.asServiceRole.entities.Referral.create({
    referrer_email: referrer.email,
    referred_email,
    referral_code,
    bonus_amount: bonus,
    investment_tier: tier,
    status: 'credited',
  });

  // Credit referrer balance
  await base44.asServiceRole.entities.User.update(referrer.id, {
    balance: (referrer.balance || 0) + bonus,
    total_earned: (referrer.total_earned || 0) + bonus,
  });

  // Record transaction for referrer
  await base44.asServiceRole.entities.Transaction.create({
    user_email: referrer.email,
    type: 'referral_bonus',
    amount: bonus,
    status: 'completed',
    notes: `Bono por referido ${referred_email} - ${tier}`,
  });

  return Response.json({ ok: true, bonus, referrer_email: referrer.email });
});