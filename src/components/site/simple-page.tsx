export function SimplePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
        {intro ? <p className="mt-3 text-sm leading-6 text-ink-500">{intro}</p> : null}
        <div className="prose-readable mt-8">{children}</div>
      </div>
    </div>
  );
}
