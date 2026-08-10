import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 });

    const payload = await req.json();
    const code = String(payload.code || '').trim().toUpperCase();
    const bonus = {
      codigo: 'APEX2026',
      monto_bono: 5000,
      min_referidos: 3,
      min_inversion_referidos: 1000,
      min_deposito: 300,
    };

    if (code !== bonus.codigo) {
      return Response.json({ error: 'Código inválido' }, { status: 400 });
    }
    if (user.bono_codigo_activado) {
      return Response.json({ error: 'Ya activaste un código especial' }, { status: 409 });
    }

    const [referrals, deposits] = await Promise.all([
      base44.entities.Referral.filter({ referrer_email: user.email }),
      base44.entities.Transaction.filter({ user_email: user.email, type: 'deposit' }),
    ]);

    const referredEmails = [...new Set(referrals.map((r) => r.referred_email).filter(Boolean))];
    const referredInvestments = await Promise.all(
      referredEmails.map((email) =>
        base44.asServiceRole.entities.Investment.filter({ user_email: email, status: 'active' })
      )
    );

    // Referidos activos = referidos con al menos un nodo de inversión activo
    const activeReferrals = referredEmails.filter((_, i) => referredInvestments[i].length > 0).length;
    // Inversión total acumulada de todos los referidos
    const totalReferralInvestment = referredInvestments
      .flat()
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    // Depósito aprobado/completado más alto del usuario
    const maxDeposit = deposits
      .filter((d) => d.status === 'approved' || d.status === 'completed')
      .reduce((max, d) => Math.max(max, Number(d.amount || 0)), 0);

    const referralsMet =
      activeReferrals >= bonus.min_referidos &&
      totalReferralInvestment >= bonus.min_inversion_referidos;
    const depositMet = maxDeposit > bonus.min_deposito;
    const eligible = referralsMet || depositMet;

    const stats = { referrals: activeReferrals, referralInvestment: totalReferralInvestment, maxDeposit };

    if (!eligible) {
      return Response.json({ eligible: false, bonus, stats });
    }

    const freshUsers = await base44.asServiceRole.entities.User.filter({ email: user.email });
    const freshUser = freshUsers[0];
    if (!freshUser || freshUser.bono_codigo_activado) {
      return Response.json({ error: 'Ya activaste un código especial' }, { status: 409 });
    }

    await base44.asServiceRole.entities.User.update(freshUser.id, {
      balance: Number(freshUser.balance || 0) + bonus.monto_bono,
      bono_codigo_activado: true,
    });
    await base44.asServiceRole.entities.Transaction.create({
      user_email: user.email,
      type: 'referral_bonus',
      amount: bonus.monto_bono,
      status: 'completed',
      notes: `Bono código ${bonus.codigo}`,
    });

    return Response.json({ eligible: true, bonus, stats });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});