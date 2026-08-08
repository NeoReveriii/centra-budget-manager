import type { RefObject } from "react";
import SiteHeader from "@/components/SiteHeader";

interface LandingHeaderProps {
  headerRef: RefObject<HTMLElement | null>;
  shellRef: RefObject<HTMLDivElement | null>;
}

export default function LandingHeader({ headerRef, shellRef }: LandingHeaderProps) {
  return <SiteHeader mode="landing" headerRef={headerRef} shellRef={shellRef} />;
}
