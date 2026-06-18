import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Bono por tier del nodo activado
const BONUS_MAP = { prueba: 0, starter: 5, advance: 25, elite: 50, institutional: 100 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Accepts both admin and authenticated user calls
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { referral_code, tier, referred_email } = await req.json();
    if (!referral_code || !tier || !referred_email) {
      return Response.json({ error: 'Missing params: referral_code, tier, referred_email required' }, { status: 400 });
    }

    // Skip zero-bonus tiers (prueba plan)
    const bonus = BONUS_MAP[tier] ?? 5;
    if (bonus === 0) {
      return Response.json({ ok: false, reason: 'No bonus for this tier' });
    }

    // Idempotency check — only one referral bonus per referred user ever
    const existing = await base44.asServiceRole.entities.Referral.filter({ referred_email });
    if (existing.length > 0) {
      return Response.json({ ok: false, reason: 'Referral already processed for this user' });
    }

    // Find referrer by code
    const referrers = await base44.asServiceRole.entities.User.filter({ referral_code });
    if (referrers.length === 0) {
      return Response.json({ ok: false, reason: 'Referral code not found' });
    }

    const referrer = referrers[0];
    if (referrer.email === referred_email) {
      return Response.json({ ok: false, reason: 'Self referral not allowed' });
    }

    // Also verify the referred user actually exists
    const referredUsers = await base44.asServiceRole.entities.User.filter({ email: referred_email });
    if (referredUsers.length === 0) {
      return Response.json({ ok: false, reason: 'Referred user not found' });
    }

    // Credit atomically
    await Promise.all([
      base44.asServiceRole.entities.Referral.create({
        referrer_email: referrer.email,
        referred_email,
        referral_code,
        bonus_amount: bonus,
        investment_tier: tier,
        status: 'credited',
      }),
      base44.asServiceRole.entities.User.update(referrer.id, {
        balance: (referrer.balance || 0) + bonus,
        total_earned: (referrer.total_earned || 0) + bonus,
      }),
      base44.asServiceRole.entities.Transaction.create({
        user_email: referrer.email,
        type: 'referral_bonus',
        amount: bonus,
        status: 'completed',
        notes: `Bono por referido ${referred_email} — plan ${tier.toUpperCase()}`,
      }),
    ]);

    // Notify referrer via email
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: referrer.email,
        subject: '🎉 ¡Tu referido activó su nodo!',
        body: `
          <div style="font-family:sans-serif;background:#050505;color:#d4b87a;padding:32px;">
            <h2 style="color:#c5a059;">¡Bono de Referido Acreditado!</h2>
            <p>Tu referido <strong>${referred_email}</strong> activó un nodo <strong>${tier.toUpperCase()}</strong>.</p>
            <p style="font-size:20px;color:#e8c97a;font-weight:bold;">+$${bonus} USDT acreditados a tu balance</p>
            <p style="color:#888;font-size:12px;">Ingresa a tu panel para verificar tu saldo actualizado.</p>
          </div>
        `,
      });
    } catch (_emailErr) {
      // Email failure is non-critical — bonus was already credited
    }

    return Response.json({ ok: true, bonus, referrer_email: referrer.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});