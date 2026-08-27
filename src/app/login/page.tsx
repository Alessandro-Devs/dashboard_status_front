"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";

type LoginUser = { id: number; name: string; email: string; role: string; updatedPassword: boolean };
const inputClass = "h-12 w-full rounded-lg border border-[#d5e0e9] bg-white px-3 text-[14px] text-[#17324a] outline-none transition placeholder:text-[#a1afbc] focus:border-[#2f82d5] focus:ring-2 focus:ring-[#2f82d5]/15";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try { const response = await apiFetch<{ user: LoginUser }>("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }); window.localStorage.setItem("dashboard:user", JSON.stringify(response.user)); if (response.user.updatedPassword) setUser(response.user); else { window.localStorage.setItem("dashboard:lastActivity", String(Date.now())); router.push("/administracion"); } }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesión."); } finally { setLoading(false); }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPassword) return setError("La nueva contraseña es obligatoria.");
    if (newPassword !== confirmPassword) return setError("Las contraseñas no coinciden.");
    setError(""); setLoading(true);
    try { await apiFetch("/auth/password", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user?.id, password: newPassword }) }); if (user) window.localStorage.setItem("dashboard:user", JSON.stringify({ ...user, updatedPassword: false })); window.localStorage.setItem("dashboard:lastActivity", String(Date.now())); router.push("/administracion"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible actualizar la contraseña."); } finally { setLoading(false); }
  }

  const isUpdating = user !== null;
  return <main className="fixed inset-0 z-10 flex h-screen w-full items-center justify-center overflow-hidden bg-[#f3f7fb] px-4 py-8 text-[#17324a]"><section className="w-full max-w-[460px] rounded-2xl border border-[#dce6ef] bg-white p-8 shadow-[0_18px_45px_rgba(27,58,87,.12)] sm:p-10"><div className="mb-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#e8f3ff] text-[21px] font-bold text-[#176fc8]">D</div><h1 className="mt-5 text-[26px] font-semibold">{isUpdating ? "Actualiza tu contraseña" : "Iniciar sesión"}</h1><p className="mt-1.5 text-[13px] text-[#8294a6]">{isUpdating ? "Por seguridad, debes establecer una nueva contraseña para continuar." : "Accede al dashboard de modernización educativa"}</p></div>{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-[13px] text-red-700">{error}</p>}{isUpdating ? <form className="space-y-4" onSubmit={handlePasswordUpdate}><PasswordInput label="Nueva contraseña" name="new-password" value={newPassword} onChange={setNewPassword} placeholder="Ingresa tu nueva contraseña" /><PasswordInput label="Confirmar contraseña" name="confirm-password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repite tu nueva contraseña" /><SubmitButton loading={loading}>Guardar contraseña</SubmitButton></form> : <form className="space-y-4" onSubmit={handleLogin}><label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#526a80]">Correo electrónico</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="correo@ejemplo.com" required className={inputClass} /></label><PasswordInput label="Contraseña" name="password" value={password} onChange={setPassword} placeholder="Ingresa tu contraseña" autoComplete="current-password" /><SubmitButton loading={loading}>Iniciar sesión</SubmitButton></form>}</section></main>;
}

function PasswordInput({ label, name, value, onChange, placeholder, autoComplete = "new-password" }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder: string; autoComplete?: string }) { return <label className="block"><span className="mb-1.5 block text-[13px] font-medium text-[#526a80]">{label}</span><input type="password" name={name} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} required className={inputClass} /></label>; }
function SubmitButton({ children, loading }: { children: string; loading: boolean }) { return <button type="submit" disabled={loading} className="h-12 w-full rounded-lg bg-[#176fc8] text-[14px] font-semibold text-white transition hover:bg-[#145fae] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Redirigiendo..." : children}</button>; }
