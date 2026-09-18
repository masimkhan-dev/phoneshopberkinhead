import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  meta,
  aside,
}: PageHeroProps) {
  return (
    <section className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#171717] py-10 md:py-14">
      <div className="container-page">
        <div className={`grid gap-8 items-center ${aside ? "lg:grid-cols-[1.2fr_0.8fr]" : ""}`}>
          <div className="max-w-2xl">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#AC313F] mb-3.5 shadow-2xs">
                {eyebrow}
              </span>
            )}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] tracking-tight text-[#171717]">
              {title}
            </h1>
            {description && (
              <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#666666]">
                {description}
              </p>
            )}
            {actions && <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>}
            {meta && <div className="mt-5 pt-4 border-t border-[#E5E5E5]">{meta}</div>}
          </div>
          {aside && <div className="hidden lg:block">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
