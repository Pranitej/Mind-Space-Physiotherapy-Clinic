import type {
  Address,
  EnquiryStatus,
  Faq,
  ImageAsset,
  OpeningHours,
  PageSeo,
  RateLimitRule,
  Service,
  Stat,
  TeamMember,
  Testimonial,
  ThemeTokens,
  TimeSlotId,
  Value,
} from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — the single source of truth for the whole website.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Brand, contact details, services, team, page copy, SEO, theme colours,
 *  booking options and security limits all live here. Pages and components
 *  never hard-code business data; they read it from `siteConfig`.
 *
 *  Secrets (database URI, API keys, admin password hash, session secret) are
 *  NOT configuration — they belong in environment variables (see .env.example)
 *  and are validated at runtime by `src/lib/env.ts`.
 *
 *  Formatting conventions (India): phone numbers in +91 format, prices in INR,
 *  dates rendered as DD/MM/YYYY in the Asia/Kolkata time zone.
 */

const brand = {
  name: "MindSpace Therapy Centre",
  shortName: "MindSpace",
  tagline: "Physiotherapy & Rehabilitation",
  description:
    "Evidence-based physiotherapy in Hyderabad for back and neck pain, sports injuries, post-surgery rehabilitation and more. One-to-one sessions with experienced physiotherapists.",
  foundedYear: 2014,
} as const;

const contact = {
  /** Display format. */
  phone: "+91 98765 43210",
  /** E.164 format for tel: links and structured data. */
  phoneE164: "+919876543210",
  /** Digits only, country code first, for wa.me links. */
  whatsapp: "919876543210",
  email: "care@mindspacetherapy.in",
  address: {
    line1: "3rd Floor, Aurora Heights, Plot 42",
    line2: "Road No. 36",
    locality: "Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500033",
    country: "India",
    countryCode: "IN",
  } satisfies Address,
  geo: { latitude: 17.4316, longitude: 78.4078 },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Road+No.+36+Jubilee+Hills+Hyderabad+500033",
  hours: [
    {
      label: "Mon – Sat",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "20:00",
    },
    { label: "Sunday", days: ["Sunday"], opens: "09:00", closes: "13:00" },
  ] satisfies OpeningHours[],
} as const;

const locale = {
  /** BCP 47 locale used for number, currency and date formatting. */
  locale: "en-IN",
  /** Open Graph locale. */
  ogLocale: "en_IN",
  htmlLang: "en-IN",
  timeZone: "Asia/Kolkata",
  currency: "INR",
} as const;

const services: Service[] = [
  {
    slug: "back-neck-pain",
    name: "Back & Neck Pain",
    summary: "Relief for slipped discs, sciatica, spondylosis and desk-job posture pain.",
    description:
      "A thorough spine assessment followed by manual therapy, targeted exercise and posture coaching. We treat the cause, not just the symptoms, so the pain stays away after you finish your sessions.",
    idealFor: [
      "Slipped disc & sciatica",
      "Cervical & lumbar spondylosis",
      "Posture-related pain from desk work",
    ],
    durationMinutes: 45,
    priceFromInr: 900,
    icon: "activity",
    featured: true,
  },
  {
    slug: "sports-injury",
    name: "Sports Injury Rehab",
    summary: "Return to play safely after sprains, ligament tears and overuse injuries.",
    description:
      "Sport-specific rehabilitation that rebuilds strength, mobility and confidence. Programmes progress from pain relief to performance testing so you return to your game at full capacity.",
    idealFor: ["ACL & ligament injuries", "Runner's knee & shin splints", "Tennis / golfer's elbow"],
    durationMinutes: 60,
    priceFromInr: 1200,
    icon: "dumbbell",
    featured: true,
  },
  {
    slug: "post-surgery-rehab",
    name: "Post-Surgery Rehabilitation",
    summary: "Structured recovery after knee or hip replacement, fractures and spine surgery.",
    description:
      "We work alongside your orthopaedic surgeon's protocol to restore movement, strength and independence after surgery, with clear milestones at every stage of recovery.",
    idealFor: ["Knee & hip replacement", "Fracture recovery", "Spine & arthroscopic surgery"],
    durationMinutes: 60,
    priceFromInr: 1200,
    icon: "bone",
    featured: true,
  },
  {
    slug: "neuro-rehab",
    name: "Neurological Rehabilitation",
    summary: "Regain balance, movement and daily independence after stroke or nerve injury.",
    description:
      "Goal-based therapy for neurological conditions using task-specific training, balance work and gait retraining, with family members involved so progress continues at home.",
    idealFor: ["Stroke recovery", "Parkinson's disease", "Peripheral nerve injuries"],
    durationMinutes: 60,
    priceFromInr: 1500,
    icon: "brain",
    featured: false,
  },
  {
    slug: "womens-health",
    name: "Women's Health Physiotherapy",
    summary: "Pre- and post-natal care, pelvic floor rehabilitation and diastasis recti support.",
    description:
      "Private, one-to-one sessions with a women's health physiotherapist covering pregnancy-related pain, postnatal recovery and pelvic floor strengthening.",
    idealFor: ["Pregnancy back & pelvic pain", "Postnatal recovery", "Pelvic floor weakness"],
    durationMinutes: 45,
    priceFromInr: 1200,
    icon: "heart-pulse",
    featured: false,
  },
  {
    slug: "home-visits",
    name: "Home Visit Physiotherapy",
    summary: "Expert physiotherapy at home for elderly patients and those with limited mobility.",
    description:
      "Our physiotherapists bring the session to you anywhere within 10 km of Jubilee Hills, with portable equipment and a programme designed around your home.",
    idealFor: ["Elderly & bed-bound patients", "Early post-operative care", "Anyone unable to travel"],
    durationMinutes: 60,
    priceFromInr: 1500,
    icon: "home",
    featured: false,
  },
];

const team: TeamMember[] = [
  {
    name: "Dr. Ananya Rao",
    role: "Founder & Clinical Director",
    qualifications: "MPT (Orthopaedics)",
    experienceYears: 14,
    bio: "Ananya founded MindSpace to offer unhurried, one-to-one physiotherapy. She leads our spine and post-surgery programmes.",
    specialities: ["Spine care", "Post-surgery rehab", "Manual therapy"],
  },
  {
    name: "Dr. Karthik Reddy",
    role: "Sports Rehabilitation Lead",
    qualifications: "MPT (Sports)",
    experienceYears: 9,
    bio: "Karthik has worked with state-level cricketers and marathon runners and specialises in return-to-sport programmes.",
    specialities: ["ACL rehab", "Running injuries", "Strength & conditioning"],
  },
  {
    name: "Dr. Meera Iyer",
    role: "Neuro Rehabilitation Specialist",
    qualifications: "MPT (Neurology)",
    experienceYears: 11,
    bio: "Meera helps stroke and Parkinson's patients regain independence, working closely with families and caregivers.",
    specialities: ["Stroke recovery", "Balance training", "Gait retraining"],
  },
  {
    name: "Dr. Sana Fatima",
    role: "Women's Health Physiotherapist",
    qualifications: "BPT, Certified Pelvic Health Therapist",
    experienceYears: 7,
    bio: "Sana supports women through pregnancy and postnatal recovery with sensitive, evidence-based care.",
    specialities: ["Pre & postnatal care", "Pelvic floor", "Diastasis recti"],
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "After two years of lower back pain from long hours at my desk, six sessions with Dr. Ananya made a difference no painkiller could. I finally understand what to do on my own.",
    author: "Ravi K.",
    context: "Software engineer, Gachibowli",
  },
  {
    quote:
      "I was back to running my first half marathon five months after ACL surgery. The programme was clear, progressive and genuinely motivating.",
    author: "Priyanka S.",
    context: "Recreational runner, Banjara Hills",
  },
  {
    quote:
      "The home visits for my father after his stroke were a blessing. Dr. Meera taught all of us how to help him, and he now walks with just a stick.",
    author: "Farhan A.",
    context: "Caregiver, Tolichowki",
  },
];

const faqs: Faq[] = [
  {
    question: "Do I need a doctor's referral to book?",
    answer:
      "No. You can book directly with us. If you have recent scans, X-rays or surgical notes, please bring them to your first visit.",
  },
  {
    question: "What happens in the first session?",
    answer:
      "Your first visit is a detailed assessment: we discuss your history, examine movement and strength, explain what is causing the problem and agree a treatment plan with you. Treatment usually begins in the same session.",
  },
  {
    question: "How many sessions will I need?",
    answer:
      "It depends on the condition, but most patients notice clear improvement within 4–6 sessions. We review progress regularly and never book sessions you don't need.",
  },
  {
    question: "Can I claim the cost on health insurance?",
    answer:
      "Many policies cover physiotherapy, especially after surgery. We provide itemised GST-compliant receipts and treatment summaries for your insurer.",
  },
  {
    question: "What should I wear?",
    answer:
      "Comfortable, loose clothing that lets us see and move the area being treated — for example shorts for knee problems or a vest top for shoulder problems.",
  },
];

const stats: Stat[] = [
  { value: "12+", label: "Years of clinical experience" },
  { value: "8,000+", label: "Patients treated" },
  { value: "4", label: "Specialist physiotherapists" },
  { value: "48 hrs", label: "Typical wait for a first appointment" },
];

const values: Value[] = [
  {
    title: "One-to-one, always",
    description: "Every session is with a qualified physiotherapist. No assistants, no shared slots.",
    icon: "users",
  },
  {
    title: "Evidence-based care",
    description: "Treatment plans follow current clinical research, not trends or guesswork.",
    icon: "shield-check",
  },
  {
    title: "Clear plans, honest timelines",
    description: "You will know what is wrong, what we will do and roughly how long it will take.",
    icon: "calendar-check",
  },
];

/** Photo credits and licences: public/images/CREDITS.md. */
const images = {
  hero: {
    src: "/images/hero.jpg",
    alt: "Physiotherapist correcting a patient's grip during a light dumbbell strengthening exercise",
    width: 1600,
    height: 1067,
  },
  clinic: {
    src: "/images/clinic.jpg",
    alt: "Bright, calm treatment room with an adjustable treatment table beside a large window",
    width: 1200,
    height: 800,
  },
  treatment: {
    src: "/images/treatment.jpg",
    alt: "Physiotherapist performing manual therapy on a patient's shoulder",
    width: 1200,
    height: 800,
  },
} satisfies Record<string, ImageAsset>;

const navigation = {
  main: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Book an appointment", href: "/contact" },
  footer: [
    { label: "Services", href: "/services" },
    { label: "About us", href: "/about" },
    { label: "Book an appointment", href: "/contact" },
    { label: "Privacy policy", href: "/privacy" },
  ],
} as const;

const pages = {
  home: {
    seo: {
      title: "Physiotherapy Clinic in Jubilee Hills, Hyderabad",
      description:
        "Expert one-to-one physiotherapy in Jubilee Hills, Hyderabad for back pain, sports injuries and post-surgery rehab. Book an assessment online today.",
    },
    hero: {
      eyebrow: "Physiotherapy & Rehabilitation · Jubilee Hills, Hyderabad",
      title: "Move freely. Live without pain.",
      subtitle:
        "One-to-one physiotherapy from specialists who take the time to find the cause of your pain — and build a plan that gets you back to the life you love.",
      primaryCta: { label: "Book an assessment", href: "/contact" },
      secondaryCta: { label: "Explore services", href: "/services" },
    },
    servicesIntro: {
      title: "How we can help",
      subtitle: "Specialist care for the problems we see most often.",
    },
    process: {
      title: "Your path to recovery",
      steps: [
        { title: "Book", description: "Send an enquiry online. We call you back within one working day." },
        { title: "Assess", description: "A 45-minute assessment to find the real cause of your problem." },
        { title: "Recover", description: "A personalised plan with hands-on treatment and home exercises." },
      ],
    },
    ctaBanner: {
      title: "Ready to feel better?",
      subtitle: "Tell us what's bothering you and we'll get back to you within one working day.",
      cta: { label: "Book an appointment", href: "/contact" },
    },
  },
  services: {
    seo: {
      title: "Physiotherapy Services & Fees",
      description:
        "Back and neck pain, sports injury rehab, post-surgery rehabilitation, neuro rehab, women's health and home visit physiotherapy in Hyderabad. Session lengths and fees.",
    },
    title: "Our services",
    subtitle:
      "Every programme starts with a detailed assessment and is tailored to you. Fees are per session and include GST.",
    pricingNote: "First visit includes a full assessment. Fees shown are starting prices per session.",
  },
  about: {
    seo: {
      title: "About Our Clinic & Physiotherapists",
      description:
        "Meet the experienced physiotherapists at MindSpace Therapy Centre, Jubilee Hills. Learn about our evidence-based, one-to-one approach to rehabilitation.",
    },
    title: "Care that takes its time",
    intro:
      "MindSpace Therapy Centre was founded in 2014 with a simple idea: people recover faster when they are listened to. Every session is one-to-one, every plan is personal, and every patient leaves understanding their body a little better.",
    story: [
      "We started as a two-room clinic in Jubilee Hills with a single treatment table. Today our team of four specialist physiotherapists sees patients from across Hyderabad — office workers with back pain, weekend athletes, new mothers and people rebuilding their lives after surgery or stroke.",
      "What hasn't changed is how we work. We give every patient the time a proper assessment needs, explain what we find in plain language, and measure progress so you can see it too.",
    ],
  },
  contact: {
    seo: {
      title: "Book an Appointment",
      description: `Book a physiotherapy appointment at ${brand.name}, ${contact.address.locality}, ${contact.address.city}. Call ${contact.phone} or send an enquiry online.`,
    },
    title: "Book an appointment",
    subtitle:
      "Tell us a little about what's bothering you. We'll call you back within one working day to confirm a time that suits you.",
    successTitle: "Thank you — we've received your enquiry",
    successMessage:
      "A confirmation email is on its way. Our front desk will call you within one working day to confirm your appointment.",
  },
  privacy: {
    seo: {
      title: "Privacy Policy",
      description:
        "How MindSpace Therapy Centre collects, uses and protects the personal data you share with us, in line with India's Digital Personal Data Protection Act, 2023.",
    },
    lastUpdated: "2026-11-01",
  },
} satisfies Record<string, { seo: PageSeo } & Record<string, unknown>>;

const booking = {
  /** Extra option for visitors who aren't sure which service they need. */
  generalAssessment: { slug: "general-assessment", name: "Not sure — I need an assessment" },
  timeSlots: [
    { id: "morning", label: "Morning (8 AM – 12 PM)" },
    { id: "afternoon", label: "Afternoon (12 PM – 4 PM)" },
    { id: "evening", label: "Evening (4 PM – 8 PM)" },
  ] satisfies { id: TimeSlotId; label: string }[],
  /** How far ahead a preferred date may be chosen. */
  maxDaysAhead: 60,
  responseTimeLabel: "within one working day",
  messageMaxLength: 1000,
} as const;

const admin = {
  pageSize: 20,
  statuses: [
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "booked", label: "Booked" },
    { id: "closed", label: "Closed" },
  ] satisfies { id: EnquiryStatus; label: string }[],
} as const;

const security = {
  rateLimits: {
    /** Public enquiry form, per client IP. */
    enquiry: { limit: 5, windowSeconds: 60 * 60 },
    /** Admin login attempts, per client IP. */
    adminLogin: { limit: 5, windowSeconds: 15 * 60 },
    /** Admin mutations (status updates), per client IP. */
    adminMutation: { limit: 120, windowSeconds: 60 },
  } satisfies Record<string, RateLimitRule>,
  session: {
    /** Admin session lifetime. Short by design: this dashboard holds personal data. */
    maxAgeSeconds: 8 * 60 * 60,
  },
  /** Reject JSON request bodies larger than this (bytes). */
  maxRequestBodyBytes: 10 * 1024,
} as const;

const privacy = {
  /**
   * Enquiries are deleted automatically this long after they arrive (MongoDB
   * TTL index), unless the person becomes a patient (status "booked"). Quoted
   * in the privacy notice, so the policy and the enforcement cannot drift.
   */
  enquiryRetentionMonths: 12,
} as const;

const theme = {
  colors: {
    primary: "#0F4C5C",
    primaryHover: "#0B3B47",
    primaryForeground: "#FFFFFF",
    accent: "#B84E33",
    accentHover: "#9E4029",
    accentForeground: "#FFFFFF",
    primarySoft: "#E3EEEF",
    background: "#F7F3EE",
    surface: "#FFFFFF",
    foreground: "#1F2A30",
    muted: "#55656D",
    border: "#E2DAD0",
    success: "#2F7D5B",
    danger: "#B42318",
  } satisfies ThemeTokens,
  /** Used for the browser UI (mobile address bar) and the web manifest. */
  themeColor: "#0F4C5C",
} as const;

const seo = {
  titleTemplate: `%s | ${brand.name}`,
  defaultTitle: `${brand.name} — Physiotherapy in Hyderabad`,
  keywords: [
    "physiotherapy Hyderabad",
    "physiotherapist Jubilee Hills",
    "back pain treatment Hyderabad",
    "sports injury rehab",
    "post-surgery rehabilitation",
    "home physiotherapy Hyderabad",
  ],
  /** schema.org type used for structured data. */
  schemaType: "Physiotherapy",
  priceRange: "₹₹",
} as const;

const features = {
  /** Shows the floating WhatsApp button and WhatsApp links. */
  whatsapp: true,
  /**
   * Shows a footer notice that this is a demonstration site. Keep it enabled
   * while the clinic and its people are fictional, so visitors are not misled.
   */
  demoNotice: true,
} as const;

export const siteConfig = {
  ...brand,
  contact,
  locale,
  services,
  team,
  testimonials,
  faqs,
  stats,
  values,
  images,
  navigation,
  pages,
  booking,
  admin,
  security,
  privacy,
  theme,
  seo,
  features,
} as const;

export type SiteConfig = typeof siteConfig;

/** Valid values for the "service" field on an enquiry. */
export const enquiryServiceOptions = [
  ...services.map((s) => ({ slug: s.slug, name: s.name })),
  booking.generalAssessment,
] as const;

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getServiceName(slug: string): string {
  return enquiryServiceOptions.find((s) => s.slug === slug)?.name ?? slug;
}
