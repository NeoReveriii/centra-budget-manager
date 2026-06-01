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
  /** Visual size preset — assets have large transparent padding */
  size?: 'nav' | 'sidebar';
  /** Force light assets (e.g. white header bar) regardless of app theme */
  surface?: 'light' | 'auto';
}

export function CentraBrand({
  variant = 'text',
  className,
  alt = 'Centra Budget Manager',
  to,
  size = 'nav',
  surface = 'auto',
}: CentraBrandProps) {
  const theme = useUiStore((s) => s.theme);
  const assetTheme =
    surface === 'light' ? 'light' : theme === 'dark' ? 'dark' : 'light';
  const src = BRAND_ASSETS[variant][assetTheme];

  const sizeClasses =
    variant === 'text'
      ? size === 'sidebar'
        ? 'h-9 origin-left scale-[2.4] sm:scale-[2.6]'
        : 'h-10 origin-left scale-[2.8] sm:scale-[3.1]'
      : 'h-10 w-10';

  const img = (
    <span
      className={cn(
        'inline-flex items-center overflow-visible',
        variant === 'text' && (size === 'sidebar' ? 'h-11' : 'h-14 sm:h-16'),
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className={cn('w-auto max-w-none object-contain object-left shrink-0', sizeClasses)}
      />
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center overflow-visible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
      >
        {img}
      </Link>
    );
  }

  return img;
}

export const CENTRA_FAVICON = '/favicon-32.png';
