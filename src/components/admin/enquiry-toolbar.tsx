"use client";

import {
  ArrowDownUp,
  CalendarRange,
  ChevronDown,
  LoaderCircle,
  Search,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ControlIcon, controlClasses, controlWithIconClasses } from "@/components/ui/form-field";
import { buildDashboardHref, type DashboardLinkQuery } from "@/lib/admin/display";
import { SEARCH_MAX_LENGTH, periodOptions, serviceFilterOptions, sortOptions } from "@/lib/admin/filters";
import { parseDashboardSearchParams } from "@/lib/admin/schemas";
import { cn } from "@/lib/utils";

/**
 * Search box and filters for the enquiry list. The state lives in the URL, not
 * in the component, so every view can be reloaded, bookmarked and shared.
 *
 * Without JavaScript this is a plain GET form. With it, submitting builds a
 * canonical URL (no empty parameters) and navigates client-side; the dropdowns
 * apply as soon as they change, and "/" jumps to the search box.
 */
export function EnquiryToolbar({ query }: { query: DashboardLinkQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        event.target instanceof Element &&
        event.target.closest("input, textarea, select, [contenteditable]")
      )
        return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function apply(form: HTMLFormElement) {
    const fields = Object.fromEntries(
      [...new FormData(form)].map(([name, value]) => [name, typeof value === "string" ? value : undefined]),
    );
    // The same parser as the page itself, so the UI can never build a URL the server would reject.
    const next = parseDashboardSearchParams({ ...fields, status: query.status });
    startTransition(() => router.push(buildDashboardHref({ ...next, page: 1 })));
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    apply(event.currentTarget);
  };

  const applyOnChange = (event: { currentTarget: HTMLSelectElement }) => {
    if (event.currentTarget.form) apply(event.currentTarget.form);
  };

  return (
    <form
      role="search"
      aria-label="Search and filter enquiries"
      action="/admin"
      method="get"
      onSubmit={onSubmit}
      aria-busy={isPending || undefined}
      className="rounded-2xl border border-border bg-surface p-3 shadow-soft sm:p-4"
    >
      {query.status && <input type="hidden" name="status" value={query.status} />}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-1 gap-2">
          <div className="group/field relative flex-1">
            <label htmlFor="enquiry-search" className="sr-only">
              Search enquiries
            </label>
            <ControlIcon icon={Search} />
            <input
              // Remount when the URL's search changes (e.g. its filter chip was removed), since it is uncontrolled.
              key={query.q ?? ""}
              ref={searchRef}
              id="enquiry-search"
              type="search"
              name="q"
              defaultValue={query.q}
              maxLength={SEARCH_MAX_LENGTH}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search name, phone, email or reference"
              aria-describedby="enquiry-search-hint"
              className={cn(controlClasses, controlWithIconClasses, "h-11 min-h-11 pr-12 text-sm")}
            />
            <span id="enquiry-search-hint" className="sr-only">
              Press the slash key from anywhere on the page to jump to this box.
            </span>
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-border bg-surface px-1.5 py-0.5 font-sans text-xs text-muted group-focus-within/field:hidden sm:block"
            >
              /
            </kbd>
          </div>
          <Button type="submit" variant="secondary" className="h-11 shrink-0 px-5">
            {isPending ? (
              <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            ) : (
              <Search aria-hidden="true" className="size-4" />
            )}
            <span className="sr-only sm:not-sr-only">Search</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex xl:w-auto">
          <FilterSelect
            id="enquiry-service-filter"
            name="service"
            label="Service"
            icon={Stethoscope}
            defaultValue={query.service ?? ""}
            onChange={applyOnChange}
          >
            <option value="">All services</option>
            {serviceFilterOptions.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            id="enquiry-period-filter"
            name="period"
            label="Received"
            icon={CalendarRange}
            defaultValue={query.period ?? ""}
            onChange={applyOnChange}
          >
            <option value="">Any time</option>
            {periodOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            id="enquiry-sort"
            name="sort"
            label="Sort by"
            icon={ArrowDownUp}
            defaultValue={query.sort}
            onChange={applyOnChange}
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>
      </div>
    </form>
  );
}

interface FilterSelectProps {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  defaultValue?: string;
  onChange: (event: { currentTarget: HTMLSelectElement }) => void;
  children: ReactNode;
}

function FilterSelect({ id, name, label, icon, defaultValue, onChange, children }: FilterSelectProps) {
  return (
    <div className="group/field relative xl:w-52">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <ControlIcon icon={icon} />
      <select
        // Remount when the URL changes the value (e.g. a filter chip was removed), since it is uncontrolled.
        key={defaultValue}
        id={id}
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        className={cn(
          controlClasses,
          controlWithIconClasses,
          "h-11 min-h-11 cursor-pointer appearance-none truncate pr-10 text-sm",
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
