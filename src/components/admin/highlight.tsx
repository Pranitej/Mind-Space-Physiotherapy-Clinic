import { escapeRegExp } from "@/lib/utils";

/** Marks every case-insensitive occurrence of the search term in `text`, so matches are easy to spot. */
export function Highlight({ text, term }: { text: string; term?: string }) {
  const needle = term?.trim();
  if (!needle) return text;

  // A capturing split keeps the matches: they land at the odd indexes.
  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, "i"));
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-[2px] bg-accent/20 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
