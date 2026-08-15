import { cn } from "@/lib/utils";

export type PageSkeletonVariant = "dashboard" | "transactions" | "wallets" | "goals" | "chat" | "settings";

interface PageSkeletonProps {
  variant: PageSkeletonVariant;
  label?: string;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-shimmer rounded-xl", className)}
    />
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-44" />
        <SkeletonBlock className="h-4 w-72 max-w-[75vw]" />
      </div>
      <SkeletonBlock className="h-11 w-32" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-32" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <SkeletonBlock className="h-80" />
        <SkeletonBlock className="h-80" />
      </div>
      <SkeletonBlock className="h-72" />
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_186px_186px]">
        <SkeletonBlock className="h-11 md:h-10" />
        <SkeletonBlock className="h-11 md:h-10" />
        <SkeletonBlock className="h-11 md:h-10" />
      </div>
      <div className="overflow-hidden rounded-xl border border-outline-variant">
        <SkeletonBlock className="h-14 rounded-none" />
        <div className="flex flex-col">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="h-[72px] rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletsSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <SkeletonBlock className="h-44 rounded-2xl" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-36" />
          <SkeletonBlock className="h-4 w-64 max-w-[70vw]" />
        </div>
        <SkeletonBlock className="h-10 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock key={index} className="h-56 rounded-[1.7rem]" />
        ))}
      </div>
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <SkeletonBlock key={index} className="h-28" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonBlock key={index} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-[800px] space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-36" />
        <SkeletonBlock className="h-4 w-72 max-w-[75vw]" />
      </div>
      {Array.from({ length: 3 }, (_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="overflow-hidden rounded-2xl border border-outline-variant"
        >
          <div className="space-y-2 border-b border-outline-variant p-5">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-3 w-56 max-w-[65vw]" />
          </div>
          <div className="space-y-px bg-outline-variant">
            {Array.from({ length: sectionIndex === 0 ? 3 : 2 }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex h-[72px] items-center justify-between bg-surface-container-lowest px-5"
              >
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="h-3 w-48 max-w-[55vw]" />
                </div>
                <SkeletonBlock className="h-9 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[640px] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex h-[72px] items-center gap-3 border-b border-outline-variant px-4">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
      </div>
      <div className="flex-1 space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <SkeletonBlock className="h-8 w-8 rounded-full" />
          <SkeletonBlock className="h-24 w-[min(34rem,75%)] rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <SkeletonBlock className="h-16 w-[min(24rem,60%)] rounded-2xl" />
        </div>
        <div className="flex items-start gap-3">
          <SkeletonBlock className="h-8 w-8 rounded-full" />
          <SkeletonBlock className="h-32 w-[min(38rem,80%)] rounded-2xl" />
        </div>
      </div>
      <div className="border-t border-outline-variant p-4">
        <SkeletonBlock className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

export function PageSkeleton({ variant, label = "Loading content" }: PageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="pb-20"
    >
      {variant === "dashboard" ? <DashboardSkeleton /> : null}
      {variant === "transactions" ? <TransactionsSkeleton /> : null}
      {variant === "wallets" ? <WalletsSkeleton /> : null}
      {variant === "goals" ? <GoalsSkeleton /> : null}
      {variant === "chat" ? <ChatSkeleton /> : null}
      {variant === "settings" ? <SettingsSkeleton /> : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}
