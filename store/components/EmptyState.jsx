import Link from "next/link";

export default function EmptyState({ title, description, ctaLabel, ctaHref }) {
  return (
    <section className="card flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-4 h-16 w-16 rounded-full bg-background" aria-hidden />
      <h2 className="text-section-heading text-[1.125rem]">{title}</h2>
      <p className="mt-2 max-w-sm text-body text-text-secondary">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="btn-primary mt-5">
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}

