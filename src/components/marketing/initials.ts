const HONORIFIC = /^(?:dr|mr|mrs|ms|prof)\.?\s+/i;

/** "Dr. Ananya Rao" → "AR": first and last name, honorific ignored. */
export function getInitials(name: string): string {
  const parts = name.trim().replace(HONORIFIC, "").split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
