import { LoginBackdrop } from "@/features/auth/components/LoginBackdrop";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <LoginBackdrop />
      {/* Por encima del fondo: el formulario nunca queda debajo de las particulas. */}
      <div className="relative z-10">
        <LoginForm />
      </div>
    </main>
  );
}
