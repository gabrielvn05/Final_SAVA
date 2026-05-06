import { crearUsuarioInterno, delegarCapacidad } from "@/app/actions";
import { hasCapability, requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UsuariosPage() {
  const { user } = await requireAuth();
  const puedeGestionar = await hasCapability(user.id, "gestionar_usuarios");

  if (!puedeGestionar) {
    return (
      <section className="card">
        <p>Solo Decano puede crear usuarios y delegar funcionalidades.</p>
      </section>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nombres, apellidos, email, rol, activo")
    .order("created_at", { ascending: false });

  return (
    <section className="stack">
      <article className="card stack">
        <h1>Crear nuevo usuario</h1>
        <form action={crearUsuarioInterno} className="stack">
          <div className="row">
            <input name="nombres" placeholder="Nombres" required />
            <input name="apellidos" placeholder="Apellidos" required />
          </div>
          <input name="email" type="email" placeholder="Correo" required />
          <input name="password" type="password" placeholder="Contraseña temporal" required />
          <select name="rol" defaultValue="administrativo">
            <option value="administrativo">Administrativo</option>
            <option value="secretaria">Secretaria</option>
            <option value="decano">Decano</option>
            <option value="superusuario">Superusuario</option>
          </select>
          <button type="submit">Crear usuario</button>
        </form>
      </article>

      <article className="card stack">
        <h2>Delegar funcionalidad</h2>
        <form action={delegarCapacidad} className="row">
          <select name="user_id" required defaultValue="">
            <option value="" disabled>
              Seleccionar usuario
            </option>
            {(usuarios || []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombres} {u.apellidos} - {u.rol}
              </option>
            ))}
          </select>
          <select name="capability" required defaultValue="revisar_solicitudes">
            <option value="generar_solicitudes">Generar solicitudes</option>
            <option value="revisar_solicitudes">Revisar solicitudes</option>
            <option value="aprobar_solicitudes">Aprobar solicitudes</option>
            <option value="gestionar_usuarios">Gestionar usuarios</option>
          </select>
          <button type="submit">Delegar</button>
        </form>
      </article>

      <article className="card">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios || []).map((u) => (
              <tr key={u.id}>
                <td>
                  {u.nombres} {u.apellidos}
                </td>
                <td>{u.email}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? "Activo" : "Inactivo"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
