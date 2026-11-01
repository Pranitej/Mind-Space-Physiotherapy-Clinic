import {
  Activity,
  Award,
  Baby,
  Bone,
  Brain,
  CalendarCheck,
  Clock,
  Dumbbell,
  Hand,
  HeartPulse,
  House,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/config/types";

/**
 * Maps config icon names to components. Explicit imports (rather than a
 * dynamic lookup of the whole icon set) keep the bundle tree-shaken.
 */
const icons = {
  activity: Activity,
  award: Award,
  baby: Baby,
  bone: Bone,
  brain: Brain,
  "calendar-check": CalendarCheck,
  clock: Clock,
  dumbbell: Dumbbell,
  hand: Hand,
  "heart-pulse": HeartPulse,
  home: House,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  users: Users,
} satisfies Record<IconName, unknown>;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component aria-hidden="true" {...props} />;
}
