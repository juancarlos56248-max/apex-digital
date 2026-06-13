import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const subject = body.subject || '📘 Comunicado Oficial — Apex Digital';
        const emailBody = body.body || '';

        const users = await base44.asServiceRole.entities.User.list();

        let sent = 0;
        let failed = 0;

        for (const u of users) {
            if (!u.email) continue;
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: 'Apex Digital',
                    to: u.email,
                    subject,
                    body: emailBody,
                });
                sent++;
            } catch {
                failed++;
            }
        }

        return Response.json({ success: true, sent, failed, total: users.length });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});