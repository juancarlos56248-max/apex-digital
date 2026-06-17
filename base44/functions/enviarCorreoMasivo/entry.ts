import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { subject = '📘 Comunicado Oficial — Apex Digital', body: emailBody = '' } = await req.json().catch(() => ({}));

    const users = await base44.asServiceRole.entities.User.list();
    const validUsers = users.filter(u => u.email);

    const results = await Promise.allSettled(
      validUsers.map(u =>
        base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Apex Digital',
          to: u.email,
          subject,
          body: emailBody,
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return Response.json({ success: true, sent, failed, total: validUsers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});