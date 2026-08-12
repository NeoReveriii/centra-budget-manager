import { useRef, useState } from "react";
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import flowMesh from "@/assets/landing/centra-flow-mesh.webp";
import CentraDashboardPreview from "@/components/landing/CentraDashboardPreview";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingHeader from "@/components/landing/LandingHeader";
import {
  LandingMotionPreferenceProvider,
  useLandingReducedMotion,
} from "@/components/landing/LandingMotionPreference";
import {
  FinalCta,
  KwartaSection,
  PlatformShowcase,
  ProductPairSection,
  SecuritySection,
} from "@/components/landing/LandingShowcase";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_WIPE = [0.76, 0, 0.24, 1] as const;

const heroCopyVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 1.8,
      staggerChildren: 0.09,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: EASE_OUT,
    },
  },
};

function IntroReveal() {
  const reduceMotion = useLandingReducedMotion();
  const [visible, setVisible] = useState(true);

  if (reduceMotion || !visible) {
    return null;
  }

  return (
    <m.div
      aria-hidden="true"
      initial={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
      animate={{
        clipPath: [
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          "polygon(0% 0%, 100% 0%, 100% 0%, 0% 20%)",
          "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ],
      }}
      transition={{ duration: 2.15, times: [0, 0.48, 0.9, 1], ease: EASE_WIPE }}
      onAnimationComplete={() => setVisible(false)}
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden bg-[#050806]"
    >
      <img
        src={flowMesh}
        alt=""
        width="1672"
        height="941"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(3,7,5,0.82)_0%,rgba(3,7,5,0.12)_58%,rgba(3,7,5,0.66)_100%)]" />

      <m.div
        data-intro-wave
        initial={{
          clipPath: "circle(0% at 18% 100%)",
          y: "18%",
          scale: 0.9,
          opacity: 0.76,
        }}
        animate={{
          clipPath: "circle(150% at 18% 100%)",
          y: "0%",
          scale: 1.16,
          opacity: 1,
        }}
        transition={{ duration: 1.18, ease: EASE_WIPE }}
        style={{
          background:
            "radial-gradient(ellipse 92% 76% at 8% 112%, rgba(214,255,118,0.98) 0%, rgba(132,244,168,0.9) 26%, rgba(38,173,104,0.62) 48%, rgba(8,85,52,0.2) 64%, transparent 76%)",
        }}
        className="absolute inset-0 mix-blend-screen"
      />

      <m.div
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: [0, 1, 1, 0], y: [18, 0, 0, -12], filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(6px)"] }}
        transition={{ duration: 1.7, times: [0, 0.28, 0.7, 1], ease: EASE_OUT }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#f1f7f2]"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a8e9c2]">Centra</span>
        <span className="mt-4 text-balance text-[clamp(2.5rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
          Your money, in motion.
        </span>
      </m.div>
    </m.div>
  );
}

function AnimatedScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <m.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: "left center" }}
      className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-[#75dda3]"
    />
  );
}

function ScrollProgress() {
  const reduceMotion = useLandingReducedMotion();
  return reduceMotion ? null : <AnimatedScrollProgress />;
}

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useLandingReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.8,
    restDelta: 0.001,
  });
  const copyY = useTransform(smoothProgress, [0, 0.56, 1], [0, 0, -140]);
  const copyOpacity = useTransform(smoothProgress, [0, 0.66, 0.94], [1, 1, 0]);
  const dashboardY = useTransform(smoothProgress, [0, 0.48, 1], [0, 0, -220]);
  const dashboardOpacity = useTransform(smoothProgress, [0, 0.72, 0.98], [1, 1, 0]);
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, -70]);

  return (
    <section ref={sectionRef} id="overview" className={`relative min-h-[100dvh] scroll-mt-24 ${reduceMotion ? "" : "lg:min-h-[165dvh]"}`}>
      <div className={`relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-10 ${reduceMotion ? "" : "lg:sticky lg:top-0"}`}>
        <m.div
          aria-hidden="true"
          style={reduceMotion ? undefined : { y: backgroundY }}
          className="pointer-events-none absolute inset-x-0 -top-32 h-[75rem] bg-[radial-gradient(circle_at_76%_18%,rgba(128,190,166,0.32),transparent_28%),radial-gradient(circle_at_28%_52%,rgba(223,248,233,0.7),transparent_30%)] dark:bg-[radial-gradient(circle_at_76%_18%,rgba(0,83,61,0.34),transparent_28%),radial-gradient(circle_at_28%_52%,rgba(35,72,54,0.34),transparent_30%)]"
        />

        <div className="relative mx-auto grid w-full min-w-0 max-w-[1500px] grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,0.66fr)_minmax(0,1.34fr)] lg:gap-8 xl:gap-12">
          <m.div
            style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
            variants={heroCopyVariants}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            className="mx-auto min-w-0 max-w-[42rem] text-center lg:mx-0 lg:text-left"
          >
            <m.p
              variants={heroItemVariants}
              className="font-['Manrope'] text-sm font-semibold tracking-[-0.01em] text-[#2f6b50] dark:text-[#9dddb9]"
            >
              Personal finance, made legible
            </m.p>
            <m.h1
              variants={heroItemVariants}
              className="mt-5 font-['Outfit'] text-[clamp(3.25rem,5.6vw,6.2rem)] font-semibold leading-[0.9] tracking-[-0.064em] text-[#132018] dark:text-[#f0f5f1]"
            >
              <span className="whitespace-nowrap">Every peso,</span>
              <span className="block text-[#19704f] dark:text-[#9cf0bf]">in context.</span>
            </m.h1>
            <m.p
              variants={heroItemVariants}
              className="mx-auto mt-7 max-w-[31rem] font-['Manrope'] text-base leading-7 tracking-[-0.012em] text-[#53665b] dark:text-white/64 sm:text-lg lg:mx-0"
            >
              Wallets, cash flow, goals, and Kwarta AI. One calm financial view.
            </m.p>
          </m.div>

          <m.div style={reduceMotion ? undefined : { y: dashboardY, opacity: dashboardOpacity }} className="relative min-w-0">
            <m.div
              initial={reduceMotion ? false : { opacity: 0, y: "28vh" }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { delay: 2.05, duration: 0.9, ease: EASE_OUT }
              }
              className="mx-auto w-full max-w-[68rem]"
            >
              <CentraDashboardPreview className="w-full" />
            </m.div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

function LandingExperience() {
  const reduceMotion = useLandingReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        <div id="top" className="centra-landing min-h-[100dvh] w-full overflow-x-clip bg-[#f8faf7] font-landing text-[#142019] selection:bg-[#9cf0bf] selection:text-[#062117] dark:bg-[#0b0e0c] dark:text-[#eff5f0]">
          <ScrollProgress />
          <IntroReveal />
          <a
            href="#overview"
            className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-[#9cf0bf] px-5 py-3 text-sm font-semibold text-[#062117] shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white motion-reduce:transition-none"
          >
            Skip to main content
          </a>
          <LandingHeader />

          <main>
            <Hero />
            <PlatformShowcase />
            <ProductPairSection />
            <KwartaSection />
            <SecuritySection />
            <FinalCta />
          </main>

          <LandingFooter />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

export default function LandingPage() {
  return (
    <LandingMotionPreferenceProvider>
      <LandingExperience />
    </LandingMotionPreferenceProvider>
  );
}
