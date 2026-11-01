import Image from "next/image";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site.config";

/** About page: the clinic's story beside a photo of a treatment room. */
export function ClinicStory() {
  const { story } = siteConfig.pages.about;
  const image = siteConfig.images.clinic;
  const { locality, city } = siteConfig.contact.address;

  return (
    <section>
      <Container className="grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
        <div className="lg:col-span-6">
          <h2 className="font-display text-3xl text-primary sm:text-4xl">Our story</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted">
            {story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div
            aria-hidden="true"
            className="absolute -top-6 -left-6 -z-10 hidden size-48 rounded-full border border-primary/15 lg:block"
          />
          <div className="aspect-3/2 overflow-hidden rounded-4xl border border-border bg-primary-soft">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1152px) 512px, (min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
              className="size-full object-cover"
            />
          </div>
          <p className="absolute right-4 -bottom-6 rounded-2xl border border-border bg-surface px-5 py-4 sm:right-6">
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
