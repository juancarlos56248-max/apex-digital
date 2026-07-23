import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { profit_pct = 30 } = await req.json().catch(() => ({}));

    // Find all "OPORTUNIDAD ACTIVA" transactions with status completed
    const allTxs = await base44.asServiceRole.entities.Transaction.filter({ type: 'opportunity', status: 'completed' });
    const activeTxs = allTxs.filter((t: any) => String(t.notes || '').includes('OPORTUNIDAD ACTIVA') && !String(t.notes || '').includes('DESEMBOLSADO'));

    if (activeTxs.length === 0) {
      return Response.json({ success: true, processed: 0, message: 'No hay participaciones pendientes de desembolso.' });
    }

    const results = await Promise.allSettled(
      activeTxs.map(async (tx: any) => {
        const gain = Number((tx.amount * profit_pct / 100).toFixed(2));
        const total = Number((tx.amount + gain).toFixed(2));

        // Get current user balance
        const users = await base44.asServiceRole.entities.User.filter({ email: tx.user_email });
        if (!users || users.length === 0) throw new Error(`Usuario no encontrado: ${tx.user_email}`);
        const targetUser = users[0];
        const currentBalance = Number(targetUser.balance || 0);
        const newBalance = Number((currentBalance + total).toFixed(2));

        // Credit balance
        await base44.asServiceRole.entities.User.update(targetUser.id, { balance: newBalance });

        // Mark original tx as disbursed
        await base44.asServiceRole.entities.Transaction.update(tx.id, {
          notes: tx.notes + ` | DESEMBOLSADO +${profit_pct}%`,
          status: 'completed',
        });

        // Create disbursement transaction record
        await base44.asServiceRole.entities.Transaction.create({
          user_email: tx.user_email,
          type: 'opportunity',
          amount: total,
          status: 'completed',
          notes: `DESEMBOLSO OPORTUNIDAD — Capital $${tx.amount} + Ganancia ${profit_pct}% ($${gain}) = $${total}`,
        });

        return { email: tx.user_email, amount: tx.amount, gain, total };
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').map(r => (r as any).value);
    const failed = results.filter(r => r.status === 'rejected').map(r => (r as any).reason?.message);

    return Response.json({
      success: true,
      processed: succeeded.length,
      failed: failed.length,
      profit_pct,
      details: succeeded,
      errors: failed,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});