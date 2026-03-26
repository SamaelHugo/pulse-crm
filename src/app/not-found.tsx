import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base bg-dot-pattern p-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.06)_0%,_transparent_70%)]" />

      <div className="relative text-center">
        <p className="font-mono text-8xl font-bold tracking-tighter text-accent/20">
          404
        </p>
        <h1 className="mt-4 text-xl font-semibold text-text-primary">
          Страница не найдена
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Запрашиваемая страница не существует или была перемещена
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
