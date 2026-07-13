import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { pin } = await req.json();
    if (!pin) return Response.json({ error: 'PIN requerido' }, { status: 400 });

    const users = await base44.asServiceRole.entities.User.filter({ email: user.email });
    const u = users[0];
    if (!u) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });

    // Verificar expiración
    if (!u.two_fa_expires || new Date() > new Date(u.two_fa_expires)) {
      return Response.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    // Verificar PIN
    if (u.two_fa_pin !== pin.toString()) {
      return Response.json({ error: 'Código incorrecto. Verifica tu email.' }, { status: 400 });
    }

    // PIN correcto — limpiar
    await base44.asServiceRole.entities.User.update(u.id, {
      two_fa_pin: null,
      two_fa_expires: null,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});