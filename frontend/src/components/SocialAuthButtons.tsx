import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  onSocial: (provider: "google" | "apple") => void;
  disabled: boolean;
}

export default function SocialAuthButtons({ onSocial, disabled }: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onSocial("google")}
        disabled={disabled}
        className="h-12 rounded-lg border-slate-300 bg-white text-sm font-semibold text-slate-900 shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)] active:translate-y-0 active:scale-[0.985] focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      >
        <img
          src="/assets/brand/google-g-logo.png"
          alt=""
          className="h-5 w-5 shrink-0 object-contain"
          aria-hidden="true"
        />
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onSocial("apple")}
        disabled={disabled}
        className="h-12 rounded-lg border-slate-300 bg-white text-sm font-semibold text-slate-900 shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_8px_18px_rgba(15,23,42,0.07)] active:translate-y-0 active:scale-[0.985] focus-visible:ring-primary/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      >
        <span className="relative h-5 w-8 shrink-0" aria-hidden="true">
          <img
            src="/assets/brand/apple-sign-in-logo.png"
            alt=""
            className="absolute left-1/2 top-1/2 h-10 w-10 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </span>
        Continue with Apple
      </Button>
    </div>
  );
}
