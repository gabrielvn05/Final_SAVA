"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasCapability, requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeFileName(fileName: string) {
  return fileName.replaceAll(/[^a-zA-Z0-9.\-_]/g, "_");
}

function getTextField(formData: FormData, field: string, fallback = "") {
  const value = formData.get(field);
  return typeof value === "string" ? value : fallback;
}

export async function crearSolicitud(formData: FormData) {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();
  const archivo = formData.get("justificativo") as File | null;

  if (!archivo || archivo.size === 0) {
    throw new Error("Debes adjuntar el archivo justificativo.");
  }

  const archivoPath = `${user.id}/${Date.now()}_${normalizeFileName(archivo.name)}`;
  const { error: uploadError } = await supabase.storage.from("justificativos").upload(archivoPath, archivo, {
    upsert: false
  });
  if (uploadError) throw new Error(uploadError.message);

  const payload = {
    creado_por: user.id,
    tipo: getTextField(formData, "tipo", "justificacion"),
    fecha_inicio: getTextField(formData, "fecha_inicio"),
    fecha_fin: getTextField(formData, "fecha_fin"),
    motivo: getTextField(formData, "motivo"),
    justificativo_path: archivoPath,
    justificativo_nombre: archivo.name,
    estado: "en_revision_secretaria"
  };

  const { error } = await supabase.from("solicitudes").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/solicitudes");
  redirect("/solicitudes");
}

export async function actualizarSolicitud(id: string, formData: FormData) {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data: actual, error: actualError } = await supabase
    .from("solicitudes")
    .select("id, justificativo_path, justificativo_nombre")
    .eq("id", id)
    .single();

  if (actualError || !actual) throw new Error("No se encontró la solicitud.");

  let justificativoPath = actual.justificativo_path;
  let justificativoNombre = actual.justificativo_nombre;
  const nuevoArchivo = formData.get("justificativo") as File | null;

  if (nuevoArchivo && nuevoArchivo.size > 0) {
    const nuevoPath = `${user.id}/${Date.now()}_${normalizeFileName(nuevoArchivo.name)}`;
    const { error: uploadError } = await supabase.storage.from("justificativos").upload(nuevoPath, nuevoArchivo, {
      upsert: false
    });
    if (uploadError) throw new Error(uploadError.message);
    justificativoPath = nuevoPath;
    justificativoNombre = nuevoArchivo.name;
  }

  const { error } = await supabase
    .from("solicitudes")
    .update({
      tipo: getTextField(formData, "tipo", "justificacion"),
      fecha_inicio: getTextField(formData, "fecha_inicio"),
      fecha_fin: getTextField(formData, "fecha_fin"),
      motivo: getTextField(formData, "motivo"),
      justificativo_path: justificativoPath,
      justificativo_nombre: justificativoNombre
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/solicitudes");
  revalidatePath(`/solicitudes/${id}`);
  redirect("/solicitudes");
}

export async function revisarSolicitud(id: string, observacion: string) {
  const { user } = await requireAuth();
  const puedeRevisar = await hasCapability(user.id, "revisar_solicitudes");
  if (!puedeRevisar) throw new Error("No tienes permisos para revisar.");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("solicitudes")
    .update({
      estado: "pendiente_aprobacion_decano",
      revisado_por: user.id,
      observaciones_secretaria: observacion || null
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/solicitudes");
}

export async function firmarSolicitud(id: string, aprobado: boolean, observacion: string) {
  const { user } = await requireAuth();
  const puedeAprobar = await hasCapability(user.id, "aprobar_solicitudes");
  if (!puedeAprobar) throw new Error("No tienes permisos para aprobar.");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("solicitudes")
    .update({
      estado: aprobado ? "aprobada" : "rechazada",
      firmado_por: user.id,
      observaciones_decano: observacion || null,
      fecha_firma: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/solicitudes");
}

export async function crearUsuarioInterno(formData: FormData) {
  const { user } = await requireAuth();
  const puedeGestionar = await hasCapability(user.id, "gestionar_usuarios");
  if (!puedeGestionar) throw new Error("Solo Decano puede crear usuarios.");

  const supabase = createSupabaseAdminClient();
  const email = getTextField(formData, "email");
  const password = getTextField(formData, "password");
  const nombres = getTextField(formData, "nombres");
  const apellidos = getTextField(formData, "apellidos");
  const rol = getTextField(formData, "rol", "administrativo");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error || !data.user) throw new Error(error?.message || "No se pudo crear usuario.");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    email,
    nombres,
    apellidos,
    rol,
    activo: true
  });

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/usuarios");
}

export async function delegarCapacidad(formData: FormData) {
  const { user } = await requireAuth();
  const puedeGestionar = await hasCapability(user.id, "gestionar_usuarios");
  if (!puedeGestionar) throw new Error("Solo Decano puede delegar.");

  const supabase = createSupabaseServerClient();
  const userId = getTextField(formData, "user_id");
  const capability = getTextField(formData, "capability");

  const { error } = await supabase
    .from("user_capabilities")
    .upsert({ user_id: userId, capability, otorgado_por: user.id }, { onConflict: "user_id,capability" });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
