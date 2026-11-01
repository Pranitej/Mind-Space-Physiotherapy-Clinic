import { CircleHelp } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/config/site.config";

export const FAQ_SECTION_ID = "faq";

const chip =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm " +
  "font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary-soft";

/** In-page shortcuts to each service section and the FAQs. Plain anchors: same-page jumps need no router. */
export function ServiceJumpList() {
  return (
    <nav aria-label="Jump to a service" className="mt-10">
      <ul className="flex flex-wrap gap-2">
        {siteConfig.services.map((service) => (
          <li key={service.slug}>
            <a href={`#${service.slug}`} className={chip}>
              <Icon name={service.icon} className="size-4" />
              {service.name}
            </a>
          </li>
        ))}
        <li>
          <a href={`#${FAQ_SECTION_ID}`} className={chip}>
            <CircleHelp aria-hidden="true" className="size-4" />
            FAQs
          </a>
        </li>
      </ul>
    </nav>
  );
}
