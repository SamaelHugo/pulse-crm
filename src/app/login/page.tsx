"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base bg-dot-pattern p-4">
      {/* Subtle radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.08)_0%,_transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-border bg-bg-card/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-3">
              <div className="pulse-dot h-3 w-3 rounded-full bg-accent" />
              <span className="text-2xl font-bold tracking-tight text-text-primary">
                Pulse
              </span>
              <span className="rounded bg-accent-muted px-2 py-0.5 font-mono text-xs font-medium text-accent">
                CRM
              </span>
            </div>
            <p className="text-sm text-text-muted">CRM для команд продаж</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-danger-muted px-4 py-2.5 text-sm text-danger">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pulse.ru"
                required
                className="w-full rounded-lg border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full rounded-lg border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:border-accent/40 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 rounded-lg border border-border/50 bg-bg-elevated/50 px-4 py-3 text-center">
            <p className="text-xs text-text-muted">
              Демо: <span className="font-medium text-text-secondary">admin@pulse.ru</span>{" "}
              / <span className="font-medium text-text-secondary">demo123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
