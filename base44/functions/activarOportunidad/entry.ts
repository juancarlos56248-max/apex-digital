import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { OPPORTUNITY_CLOSE_AT } from '../../shared/opportunitySchedule.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    if (Date.now() >= OPPORTUNITY_CLOSE_AT) {
      return Response.json({ error: 'La recaudación ya cerró. La inversión de 3 días está en curso.' }, { status: 400 });
    }

    const { amount } = await req.json();
    const investmentAmount = Number(amount);
    if (!Number.isFinite(investmentAmount) || investmentAmount < 50) {
      return Response.json({ error: 'El monto mínimo para participar es $50 USDT.' }, { status: 400 });
    }

    const transactions = await base44.asServiceRole.entities.Transaction.filter({ user_email: user.email });
    const existing = transactions.find((item) => {
      const notes = String(item.notes || '');
      return notes.includes('OPORTUNIDAD ACTIVA') && !notes.includes('DESEMBOLSADO');
    });
    if (existing) {
      return Response.json({ error: 'Ya tienes una participación activa.' }, { status: 409 });
    }

    const currentUser = await base44.asServiceRole.entities.User.get(user.id);
    const currentBalance = Number(currentUser.balance || 0);
    if (currentBalance < investmentAmount) {
      return Response.json({ error: `Saldo insuficiente. Tienes $${currentBalance.toFixed(2)} USDT disponibles.` }, { status: 400 });
    }

    const newBalance = Number((currentBalance - investmentAmount).toFixed(2));
    await base44.asServiceRole.entities.User.update(user.id, { balance: newBalance });

    let transaction;
    try {
      transaction = await base44.asServiceRole.entities.Transaction.create({
        user_email: user.email,
        type: 'opportunity',
        amount: investmentAmount,
        status: 'completed',
        notes: 'OPORTUNIDAD ACTIVA — Activada con balance interno — SALDO DESCONTADO',
      });
    } catch (error) {
      await base44.asServiceRole.entities.User.update(user.id, { balance: currentBalance });
      throw error;
    }

    return Response.json({ transaction, newBalance });
  } catch (error) {
    return Response.json({ error: error.message || 'No se pudo activar la oportunidad.' }, { status: 500 });
  }
});