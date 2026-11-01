export const MAIN_CONTENT_ID = "main-content";

/** First focusable element on every page: lets keyboard users jump past the header. */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={
        "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex " +
        "focus:h-11 focus:items-center focus:rounded-full focus:bg-primary focus:px-5 focus:text-sm " +
        "focus:font-semibold focus:text-primary-foreground"
      }
    >
      Skip to main content
    </a>
  );
}
