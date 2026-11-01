import Image from "next/image";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site.config";

/** About page: the clinic's story beside a photo of a treatment room. */
export function ClinicStory() {
  const { story } = siteConfig.pages.about;
  const image = siteConfig.images.clinic;
  const { locality, city } = siteConfig.contact.address;

  return (
    <section>
      <Container className="grid items-center gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
        <div data-reveal className="lg:col-span-6">
          <SectionHeading eyebrow={`Since ${siteConfig.foundedYear}`} title="Our story" />
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div data-reveal className="relative lg:col-span-6">
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border border-primary/15 sm:translate-x-5 sm:translate-y-5"
          />
          <div className="relative aspect-3/2 overflow-hidden rounded-[2rem] bg-primary-soft shadow-lift">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1152px) 512px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
              className="size-full object-cover"
            />
          </div>
          <p className="absolute right-4 -bottom-6 rounded-2xl border border-white/60 bg-surface/90 px-5 py-4 shadow-lift backdrop-blur-md sm:right-8">
            <span className="block text-xs font-semibold tracking-wide text-muted uppercase">
              {locality}, {city}
            </span>
            <span className="mt-1 block font-display text-lg text-primary">
              Since {siteConfig.foundedYear}
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
