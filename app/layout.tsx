import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReactNode } from "react";

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="es">
      <body>
        {user ? (
          <AppShell userId={user.id} userEmail={user.email}>
            {children}
          </AppShell>
        ) : (
          <div className="app-public">{children}</div>
        )}
      </body>
    </html>
  );
}
