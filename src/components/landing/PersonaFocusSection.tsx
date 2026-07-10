/**
 * PersonaFocusSection — Server Component.
 *
 * A typography-led section stating the deliberate persona scoping decision
 * with strategic confidence. Two-column layout at desktop (label left,
 * prose right), single column on mobile.
 *
 * No cards, no icons — editorial restraint is intentional here.
 */
export function PersonaFocusSection() {
  return (
    <section
      className="w-full max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28"
      aria-labelledby="persona-heading"
    >
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-16 items-start">

        {/* Left: vertical label */}
        <div className="md:pt-2">
          <span
            id="persona-heading"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[--primary]"
          >
            Design Decision
          </span>
        </div>

        {/* Right: prose */}
        <div className="space-y-5 max-w-160">
          <h2 className="text-2xl md:text-3xl font-bold text-[--foreground] leading-snug tracking-tight">
            Scoped deliberately to one persona: the venue operator.
          </h2>

          <p className="text-[0.9375rem] text-[--foreground-muted] leading-relaxed">
            VenueMind AI is not a general-purpose event management platform. It is built
            exclusively for the operations staff managing a stadium during a live FIFA World Cup
            2026 match — the crowd control coordinator, the safety officer, the transport
            dispatcher. Every feature, every piece of telemetry, every AI prompt is filtered
            through this single lens.
          </p>

          <p className="text-[0.9375rem] text-[--foreground-muted] leading-relaxed">
            This constraint was deliberate. Broad platforms fail the moment the stadium gates
            open and 80,000 people arrive simultaneously. Specificity is what makes the AI
            recommendations actionable, the incident queue scannable in 2 seconds, and the
            command center navigable under pressure.
          </p>

          <p className="text-[0.9375rem] text-[--foreground-muted] leading-relaxed">
            The simulation engine runs a full match cycle — pre-match ingress, first half,
            halftime, second half, post-match egress — so the system can be evaluated against
            realistic operational conditions without needing a live event.
          </p>

          {/* Thin rule + byline */}
          <div className="pt-4 border-t border-[--border] flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[--primary] flex items-center justify-center text-white text-[10px] font-bold shrink-0" aria-hidden="true">
              RA
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[--foreground]">Rahul Asthwik</p>
              <p className="text-[10px] text-[--foreground-subtle]">Designer &amp; Developer · VenueMind AI</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
