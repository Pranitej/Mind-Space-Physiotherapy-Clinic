import type { ReactNode } from "react";
import { RevealOnScroll } from "@/components/layout/reveal-on-scroll";

/**
 * Templates remount on every navigation (layouts do not), which makes this the
 * place for per-page motion: the incoming page fades up while the header and
 * footer stay put, and the scroll-reveal observer rescans the new page.
 */
export default function MarketingTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="motion-safe:animate-page-in">
      {children}
      <RevealOnScroll />
    </div>
  );
}
