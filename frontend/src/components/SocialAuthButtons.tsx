import { Apple } from "lucide-react";
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
        className="h-12 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="text-base font-extrabold text-[#4285f4]" aria-hidden="true">G</span>
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onSocial("apple")}
        disabled={disabled}
        className="h-12 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:border-slate-300 hover:bg-slate-50"
      >
        <Apple className="h-[18px] w-[18px] text-slate-900" aria-hidden="true" />
        Apple
      </Button>
    </div>
  );
}
