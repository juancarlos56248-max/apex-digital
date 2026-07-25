import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await req.json();
    const code = String(payload.code || '').trim().toUpperCase();
    const bonus = { codigo: 'APEX1000S', monto_bono: 1000, min_node: 300, min_referidos: 3 };

    if (code !== bonus.codigo) {
      return Response.json({ error: 'Código inválido' }, { status: 400 });
    }
    if (user.bono_codigo_activado) {
      return Response.json({ error: 'Ya activaste un código especial' }, { status: 409 });
    }

    const [investments, referrals] = await Promise.all([
      base44.entities.Investment.filter({ user_email: user.email, status: 'active' }),
      base44.entities.Referral.filter({ referrer_email: user.email })
    ]);

    const nodeAmount = investments.reduce((max, investment) => Math.max(max, Number(investment.amount || 0)), 0);
    const referredEmails = [...new Set(referrals.map((referral) => referral.referred_email).filter(Boolean))];
    const referredInvestments = await Promise.all(
      referredEmails.map((email) => base44.asServiceRole.entities.Investment.filter({ user_email: email, status: 'active' }))
    );
    const activeReferrals = referredInvestments.filter((items) => items.length > 0).length;
    const stats = { nodeAmount, referrals: activeReferrals };

    if (nodeAmount < bonus.min_node || activeReferrals < bonus.min_referidos) {
      return Response.json({ eligible: false, bonus, stats });
    }

    const freshUsers = await base44.asServiceRole.entities.User.filter({ email: user.email });
    const freshUser = freshUsers[0];
    if (!freshUser || freshUser.bono_codigo_activado) {
      return Response.json({ error: 'Ya activaste un código especial' }, { status: 409 });
    }

    await base44.asServiceRole.entities.User.update(freshUser.id, {
      balance: Number(freshUser.balance || 0) + bonus.monto_bono,
      bono_codigo_activado: true
    });
    await base44.asServiceRole.entities.Transaction.create({
      user_email: user.email,
      type: 'referral_bonus',
      amount: bonus.monto_bono,
      status: 'completed',
      notes: `Bono código ${bonus.codigo}`
    });

    return Response.json({ eligible: true, bonus, stats });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});