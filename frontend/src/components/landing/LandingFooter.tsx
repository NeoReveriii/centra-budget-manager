import { ArrowUp, ArrowUpRight } from "lucide-react";
import { m } from "framer-motion";
import { CentraBrand } from "@/components/CentraBrand";
import { useLandingReducedMotion } from "@/components/landing/LandingMotionPreference";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Platform", href: "#platform" },
      { label: "Kwarta AI", href: "#kwarta" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/views/privacy.html" },
      { label: "Terms", href: "/views/terms.html" },
    ],
  },
] as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const NO_MOTION_TRANSITION = { duration: 0 } as const;
const LINK_FILL_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.72,
} as const;
const BACK_TO_TOP_HOVER = { y: -2 } as const;
const BACK_TO_TOP_TAP = { scale: 0.98 } as const;

const FOOTER_REVEAL_VARIANTS = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: EASE_OUT },
  },
};

const NAV_REVEAL_VARIANTS = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.08 },
  },
};

const NAV_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.44, ease: EASE_OUT },
  },
};

const LINK_CONTENT_VARIANTS = {
  rest: { x: 0 },
  active: { x: 3 },
};

const LINK_UNDERLINE_VARIANTS = {
  rest: { scaleX: 0 },
  active: { scaleX: 1 },
};

const RIBBON_REVEAL_VARIANTS = {
  hidden: { opacity: 0, x: 56 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE_OUT },
  },
};

export default function LandingFooter() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <footer className="relative isolate overflow-hidden border-t border-[#bfd0c4] bg-[#e8f0ea] text-[#142019] dark:border-white/10 dark:bg-[#0d100e] dark:text-[#eff5f0]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_7%_8%,rgba(25,112,79,0.15),transparent_31%),radial-gradient(circle_at_91%_70%,rgba(87,190,132,0.22),transparent_31%)] dark:bg-[radial-gradient(circle_at_7%_8%,rgba(156,240,191,0.08),transparent_30%),radial-gradient(circle_at_90%_72%,rgba(156,240,191,0.07),transparent_28%)]"
        aria-hidden="true"
      />
      <m.div
        aria-hidden="true"
        variants={RIBBON_REVEAL_VARIANTS}
        initial={reduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        className="pointer-events-none absolute -right-28 -top-36 h-[40rem] w-[22rem] rotate-[14deg] opacity-100 lg:-right-20 lg:-top-28 lg:h-[46rem] lg:w-[26rem]"
      >
        <span className="absolute inset-y-0 right-0 w-[10.5rem] bg-gradient-to-b from-[#0f6847]/[0.22] via-[#3d9e70]/[0.12] to-transparent [clip-path:polygon(32%_0,100%_0,68%_100%,0_100%)] dark:from-[#9cf0bf]/[0.075] dark:via-[#9cf0bf]/[0.025]" />
        <span className="absolute inset-y-16 right-[9.75rem] w-[4.5rem] bg-gradient-to-b from-[#19704f]/[0.17] via-[#67bd88]/[0.08] to-transparent [clip-path:polygon(35%_0,100%_0,65%_100%,0_100%)] dark:from-[#9cf0bf]/[0.055] dark:via-transparent" />
      </m.div>

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <m.div
          variants={FOOTER_REVEAL_VARIANTS}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
          className="grid gap-x-10 gap-y-14 py-16 sm:py-20 lg:grid-cols-12 lg:py-24 xl:gap-x-14"
        >
          <section className="lg:col-span-4">
            <CentraBrand
              variant="text"
              size="nav"
              surface="auto"
              align="left"
              to="/"
              alt="Centra home"
              className="origin-left scale-[1.08]"
            />
            <p className="mt-7 text-sm font-semibold tracking-[-0.01em] text-[#24523d] dark:text-[#b9e9cb]">
              Personal finance, made legible.
            </p>
            <p className="mt-3 max-w-[31rem] text-[0.98rem] leading-7 text-[#53665a] dark:text-white/66">
              A clear home for wallets, transactions, savings goals, and Kwarta AI, built to keep every money decision in context.
            </p>
          </section>

          <m.nav
            aria-label="Footer navigation"
            variants={NAV_REVEAL_VARIANTS}
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-2 xl:grid-cols-3"
          >
            {footerGroups.map((group) => (
              <FooterLinkGroup
                key={group.title}
                title={group.title}
                links={group.links}
                reduceMotion={reduceMotion}
              />
            ))}
          </m.nav>

          <m.aside
            variants={NAV_ITEM_VARIANTS}
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            aria-label="Centra point of view"
            className="max-w-[24rem] lg:col-span-3 lg:justify-self-end"
          >
            <p className="text-balance text-[clamp(2rem,3.1vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#183e2f] dark:text-[#f0f7f2]">
              Balances show a number.
              <span className="mt-1 block text-[#19704f] dark:text-[#9cf0bf]">Centra shows the context.</span>
            </p>
            <p className="mt-5 max-w-[20rem] text-sm leading-6 text-[#5b6d62] dark:text-white/62">
              See what changed, what it affects, and what to do next without piecing together separate tools.
            </p>
          </m.aside>
        </m.div>

        <m.div
          variants={NAV_ITEM_VARIANTS}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.75 }}
          className="flex flex-col gap-3 border-t border-[#cbd8cf] py-7 text-[0.8rem] text-[#56685d] dark:border-white/12 dark:text-white/60 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>&copy; 2026 Centra Financial Systems</p>
          <m.a
            href="#top"
            whileHover={reduceMotion ? undefined : BACK_TO_TOP_HOVER}
            whileTap={reduceMotion ? undefined : BACK_TO_TOP_TAP}
            className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-full text-sm font-semibold text-[#1f513a] transition-colors duration-200 hover:text-[#0d5038] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#e8f0ea] dark:text-[#a9e9c1] dark:hover:text-[#cbf5da] dark:focus-visible:ring-[#9cf0bf] dark:focus-visible:ring-offset-[#0d100e] motion-reduce:transition-none"
          >
            Back to top
            <ArrowUp
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </m.a>
        </m.div>
      </div>
    </footer>
  );
}

interface FooterLinkGroupProps {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  reduceMotion: boolean;
}

function FooterLinkGroup({ title, links, reduceMotion }: FooterLinkGroupProps) {
  const transition = reduceMotion ? NO_MOTION_TRANSITION : LINK_FILL_TRANSITION;

  return (
    <m.div variants={NAV_ITEM_VARIANTS}>
      <p className="mb-3 text-[0.72rem] font-semibold tracking-[0.12em] text-[#5b6d62] dark:text-white/56">
        {title}
      </p>
      <div className="flex flex-col">
        {links.map((link) => (
          <m.a
            key={link.label}
            href={link.href}
            initial="rest"
            animate="rest"
            whileHover="active"
            whileFocus="active"
            className={`group relative flex min-h-11 w-full max-w-[10.5rem] items-center rounded-sm pr-1 text-sm font-medium text-[#42584b] hover:text-[#0d5038] focus-visible:text-[#0d5038] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19704f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8f0ea] dark:text-white/68 dark:hover:text-[#b8f5cf] dark:focus-visible:text-[#b8f5cf] dark:focus-visible:ring-[#9cf0bf] dark:focus-visible:ring-offset-[#0d100e] ${
              reduceMotion ? "transition-none" : "transition-colors duration-200"
            }`}
          >
            <m.span
              variants={LINK_CONTENT_VARIANTS}
              transition={transition}
              className="flex w-full items-center justify-between gap-3"
            >
              <span>{link.label}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 opacity-[0.45] transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80 motion-reduce:transition-none"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </m.span>
            <span
              className="pointer-events-none absolute inset-x-0 bottom-1 h-px bg-[#bdcbc1] dark:bg-white/18"
              aria-hidden="true"
            />
            {reduceMotion ? (
              <span
                className="pointer-events-none absolute inset-x-0 bottom-1 h-0.5 origin-left scale-x-0 bg-[#19704f] transition-none group-hover:scale-x-100 group-focus-visible:scale-x-100 dark:bg-[#9cf0bf]"
                aria-hidden="true"
              />
            ) : (
              <m.span
                variants={LINK_UNDERLINE_VARIANTS}
                transition={transition}
                className="pointer-events-none absolute inset-x-0 bottom-1 h-0.5 origin-left bg-[#19704f] dark:bg-[#9cf0bf]"
                aria-hidden="true"
              />
            )}
          </m.a>
        ))}
      </div>
    </m.div>
  );
}
