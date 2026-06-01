import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

const BRAND_ASSETS = {
  text: {
    light: '/assets/images/CentraTextDefault_Only.png',
    dark: '/assets/images/CentraTextDark_Only.png',
  },
  icon: {
    light: '/assets/images/CentraLogoDefault.png',
    dark: '/assets/images/CentraLogoDark.png',
  },
} as const;

export type CentraBrandVariant = keyof typeof BRAND_ASSETS;

interface CentraBrandProps {
  variant?: CentraBrandVariant;
  className?: string;
  alt?: string;
  to?: string;
}

export function CentraBrand({
  variant = 'text',
  className,
  alt = 'Centra Budget Manager',
  to,
}: CentraBrandProps) {
  const theme = useUiStore((s) => s.theme);
  const src = BRAND_ASSETS[variant][theme === 'dark' ? 'dark' : 'light'];

  const img = (
    <img
      src={src}
      alt={alt}
      className={cn(
        'object-contain object-left shrink-0',
        variant === 'text' ? 'h-8 w-auto max-w-[200px]' : 'h-9 w-9',
        className
      )}
    />
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg">
        {img}
      </Link>
    );
  }

  return img;
}

/** Tab / PWA icon — dark variant can be wired in ThemeInit later. */
export const CENTRA_FAVICON = '/assets/images/CentraLogoDefault.png';
