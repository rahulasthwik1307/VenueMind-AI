/**
 * TechStackStrip — Server Component.
 *
 * Displays the technology badges used in VenueMind AI.
 * Horizontal scroll on mobile (touch-friendly, no clipping).
 * No animation, no client state.
 */

const STACK = [
  { name: 'Next.js 15', detail: 'App Router · RSC' },
  { name: 'TypeScript', detail: 'Strict mode' },
  { name: 'Tailwind CSS v4', detail: 'Utility-first' },
  { name: 'Zustand', detail: 'State management' },
  { name: 'Groq AI', detail: 'Llama 3.3 70B' },
  { name: 'Framer Motion', detail: 'LazyMotion' },
  { name: 'Zod', detail: 'Schema validation' },
];

export function TechStackStrip() {
  return (
    <section
      id="technology"
      className="border-y border-[--border] bg-[--surface-1] scroll-mt-20"
      aria-label="Technology stack"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[--foreground-subtle] mb-5">
          Built with
        </p>

        {/* Wrapping badge row */}
        <div
          className="flex flex-wrap items-stretch gap-3 pb-1"
          role="list"
          aria-label="Technology stack badges"
        >
          {STACK.map(({ name, detail }) => (
            <div
              key={name}
              role="listitem"
              className="shrink-0 flex flex-col justify-center px-4 py-3 rounded-lg border border-[--border] bg-[--surface-2] min-w-30"
            >
              <span className="text-[11px] font-bold text-[--foreground] leading-none">
                {name}
              </span>
              <span className="text-[9px] text-[--foreground-subtle] mt-1 font-mono">
                {detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
