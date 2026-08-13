import { cn } from "@/lib/utils";

interface CentraAccountTheme {
  key: string;
  label: string;
  type: string;
  surface: string;
  accent: string;
  iconTone: string;
  pattern: string;
}

const CENTRA_ACCOUNT_THEMES: CentraAccountTheme[] = [
  {
    key: "digital-wallet",
    label: "Digital wallet theme",
    type: "E-Wallet",
    surface: "bg-[radial-gradient(circle_at_82%_12%,rgba(79,195,247,0.32),transparent_35%),linear-gradient(135deg,#144b74_0%,#0d2946_100%)]",
    accent: "bg-[#bce8f7]",
    iconTone: "text-[#164f72]",
    pattern: "bg-[linear-gradient(115deg,transparent_0_55%,rgba(255,255,255,0.08)_55.5%_68%,transparent_68.5%)]",
  },
  {
    key: "bank-account",
    label: "Bank account theme",
    type: "Bank Account",
    surface: "bg-[radial-gradient(circle_at_84%_10%,rgba(92,211,165,0.27),transparent_36%),linear-gradient(135deg,#18644e_0%,#0c392e_100%)]",
    accent: "bg-[#b8ead4]",
    iconTone: "text-[#164f3f]",
    pattern: "bg-[repeating-linear-gradient(145deg,transparent_0_28px,rgba(255,255,255,0.07)_29px_30px)]",
  },
  {
    key: "cash-account",
    label: "Cash account theme",
    type: "Cash",
    surface: "bg-[radial-gradient(circle_at_82%_8%,rgba(250,190,112,0.34),transparent_35%),linear-gradient(135deg,#9b5935_0%,#57321f_100%)]",
    accent: "bg-[#f2d4ac]",
    iconTone: "text-[#714125]",
    pattern: "bg-[radial-gradient(circle_at_78%_42%,rgba(255,255,255,0.08)_0_17%,transparent_17.5%),radial-gradient(circle_at_90%_42%,rgba(255,255,255,0.06)_0_17%,transparent_17.5%)]",
  },
  {
    key: "credit-account",
    label: "Credit account theme",
    type: "Credit Card",
    surface: "bg-[radial-gradient(circle_at_84%_8%,rgba(153,166,211,0.3),transparent_36%),linear-gradient(135deg,#37415f_0%,#171d30_100%)]",
    accent: "bg-[#d2d8ec]",
    iconTone: "text-[#303a57]",
    pattern: "bg-[linear-gradient(90deg,transparent_49.5%,rgba(255,255,255,0.06)_50%,transparent_50.5%),linear-gradient(0deg,transparent_49.5%,rgba(255,255,255,0.05)_50%,transparent_50.5%)] bg-[size:3.5rem_3.5rem]",
  },
  {
    key: "investment-account",
    label: "Investment account theme",
    type: "Investment",
    surface: "bg-[radial-gradient(circle_at_82%_10%,rgba(203,151,223,0.29),transparent_35%),linear-gradient(135deg,#654879_0%,#342640_100%)]",
    accent: "bg-[#e4cee9]",
    iconTone: "text-[#563d66]",
    pattern: "bg-[conic-gradient(from_210deg_at_78%_24%,transparent_0_23%,rgba(255,255,255,0.09)_24%_31%,transparent_32%_100%)]",
  },
];

const FALLBACK_THEME = CENTRA_ACCOUNT_THEMES[1];

export const WALLET_PROVIDER_OPTIONS = [
  { value: "custom", label: "Custom account" },
  ...CENTRA_ACCOUNT_THEMES.map((theme) => ({ value: theme.key, label: theme.label })),
] as const;

export function getWalletProviderPreset(key: string) {
  return CENTRA_ACCOUNT_THEMES.find((theme) => theme.key === key) ?? null;
}

export function inferWalletProviderKey(type: string) {
  return CENTRA_ACCOUNT_THEMES.find((theme) => theme.type === type)?.key ?? "custom";
}

function resolveAccountTheme(type: string) {
  return CENTRA_ACCOUNT_THEMES.find((theme) => theme.type === type) ?? FALLBACK_THEME;
}

function CentraThemeArtwork({ theme }: { theme: CentraAccountTheme }) {
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="absolute -right-[9%] -top-[30%] h-[88%] w-[54%] rotate-12 rounded-[32%] border border-white/14 transition-transform duration-500 ease-out group-hover/card:rotate-[16deg] group-hover/card:scale-105 motion-reduce:transform-none" />
      <span className="absolute -bottom-[46%] right-[5%] h-[86%] w-[62%] -rotate-12 rounded-[42%] bg-white/[0.07] transition-transform duration-500 ease-out group-hover/card:-translate-y-2 group-hover/card:-rotate-6 motion-reduce:transform-none" />
      <span className="absolute right-[13%] top-[42%] grid grid-cols-3 gap-1.5 opacity-35 transition-opacity duration-300 group-hover/card:opacity-55">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-[2px] bg-white" />
        ))}
      </span>
      <span className="absolute left-[5%] top-[54%] h-px w-[42%] bg-gradient-to-r from-white/28 to-transparent" />
      <span className="sr-only">Original Centra visual theme for {theme.type}</span>
    </span>
  );
}

interface WalletCardFaceProps {
  name: string;
  type: string;
  walletId: number;
  balance: number;
  status?: string;
  formatCurrency: (amount: number) => string;
  className?: string;
  preview?: boolean;
}

export function WalletCardFace({
  name,
  type,
  balance,
  status = "ACTIVE",
  formatCurrency,
  className,
  preview = false,
}: WalletCardFaceProps) {
  const theme = resolveAccountTheme(type);
  const archived = status.toUpperCase() !== "ACTIVE";

  return (
    <span
      className={cn(
        "group/card relative isolate flex aspect-[1.586/1] min-h-[11.5rem] w-full overflow-hidden rounded-[1.35rem] p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)] ring-1 ring-inset ring-white/20",
        theme.surface,
        archived && "saturate-[0.35]",
        className,
      )}
    >
      <CentraThemeArtwork theme={theme} />
      <span className={cn("pointer-events-none absolute inset-0 opacity-90", theme.pattern)} aria-hidden="true" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.15),transparent_28%,transparent_72%,rgba(255,255,255,0.05))]" aria-hidden="true" />
      <span className="pointer-events-none absolute -left-[70%] -top-1/4 h-[150%] w-[38%] -skew-x-12 bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-0 blur-sm transition-[transform,opacity] duration-700 ease-out group-hover/card:translate-x-[450%] group-hover/card:opacity-100 motion-reduce:hidden" aria-hidden="true" />

      <span className="relative z-10 flex min-w-0 flex-1 flex-col justify-between">
        <span className="flex items-start justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className={cn("flex h-9 min-w-9 items-center justify-center rounded-[0.7rem] px-2 shadow-sm ring-1 ring-white/30", theme.accent, theme.iconTone)}>
              <span className="material-symbols-outlined text-[19px]" aria-hidden="true">account_balance_wallet</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.95rem] font-extrabold leading-tight tracking-[-0.025em]">{name || "Untitled wallet"}</span>
              <span className="mt-0.5 block truncate text-[10px] font-medium uppercase tracking-[0.13em] text-white/65">{type}</span>
            </span>
          </span>
          <span className="rounded-md border border-white/20 bg-black/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
            {archived ? "Archived" : preview ? "Preview" : "Active"}
          </span>
        </span>

        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
          <span className="h-1.5 w-1.5 rounded-[2px] bg-white/70" aria-hidden="true" />
          Centra account view
        </span>

        <span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-white/60">Available balance</span>
          <span className="mt-1 block truncate text-[clamp(1.35rem,3vw,2rem)] font-extrabold leading-none tracking-[-0.05em] tabular-nums">
            {formatCurrency(balance)}
          </span>
        </span>

        <span className="flex items-end justify-between gap-4">
          <span className="min-w-0">
            <span className="block max-w-[11rem] truncate text-xs font-bold">{name || "Untitled wallet"}</span>
            <span className="mt-1 block text-[10px] font-medium tracking-[0.08em] text-white/68">No payment credentials stored</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Centra</span>
        </span>
      </span>
    </span>
  );
}
