import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";
import type { TeamMember } from "@/config/types";
import { getInitials } from "./initials";

/**
 * The team is shown with initials rather than photos: the clinic's people are
 * fictional, and stock portraits would present real strangers as staff.
 */
export function TeamGrid() {
  const { team } = siteConfig;

  return (
    <section>
      <Container className="py-20 lg:py-28">
        <SectionHeading
          title="Meet the team"
          subtitle={`${team.length} specialist physiotherapists. Every session is with one of them, from first assessment to discharge.`}
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {team.map((member) => (
            <li key={member.name}>
              <TeamCard member={member} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex h-full flex-col gap-6 rounded-3xl border border-border bg-surface p-6 sm:flex-row sm:p-8">
      <span
        aria-hidden="true"
        className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-xl text-primary ring-1 ring-primary/10"
      >
        {getInitials(member.name)}
      </span>
      <div className="flex flex-1 flex-col">
        <h3 className="font-display text-2xl text-primary">{member.name}</h3>
        <p className="mt-1 font-semibold text-foreground">{member.role}</p>
        <p className="mt-1 text-sm text-muted">
          {member.qualifications} · {member.experienceYears} years’ experience
        </p>
        <p className="mt-4 flex-1 leading-relaxed text-muted">{member.bio}</p>
        <ul aria-label={`${member.name}’s specialities`} className="mt-5 flex flex-wrap gap-2">
          {member.specialities.map((speciality) => (
            <li
              key={speciality}
              className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
            >
              {speciality}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
