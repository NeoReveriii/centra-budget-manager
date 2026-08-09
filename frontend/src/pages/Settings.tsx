import { useState } from "react";
import { useUiStore } from "@/stores/ui-store";
import { StyledSelect } from "@/components/ui/styled-select";

const Settings = () => {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const [language, setLanguage] = useState("English");

  return (
    <div className="mx-auto w-full max-w-[800px] animate-fade-in">
      <header className="mb-6">
        <h2 className="font-h1 text-h1 text-on-surface">Settings</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Manage your account preferences and system configurations.
        </p>
      </header>

      {/* Appearance Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            palette
          </span>
          <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Appearance
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant/30">
          {/* Dark Mode Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Dark Mode
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Switch between standard and low-light interface themes.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
              />
              <div className="h-5 w-10 rounded-full bg-surface-container-high peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-outline-variant after:bg-white after:content-[''] after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Contrast Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Contrast Adjustment
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Toggle between normal and high contrast modes.
              </p>
            </div>
            <button className="shrink-0 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 text-xs font-bold text-primary transition-all hover:bg-surface-dim hover:text-primary-container hover:shadow-sm active:scale-95">
              Normal Contrast
            </button>
          </div>

          {/* Language Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">Language</p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Select your preferred display language.
              </p>
            </div>
            <div className="w-full shrink-0 sm:w-[186px]">
              <StyledSelect
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "English", label: "English" },
                  { value: "Filipino", label: "Filipino" },
                  { value: "Spanish", label: "Spanish" },
                ]}
                className="rounded-xl bg-white text-on-surface"
                aria-label="Language"
              />
            </div>
          </div>

          {/* Currency Display Row */}
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Currency Display
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Show or hide the Pesos symbol (₱) in amounts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
              <input defaultChecked className="sr-only peer" type="checkbox" />
              <div className="h-5 w-10 rounded-full bg-surface-container-high peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-outline-variant after:bg-white after:content-[''] after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            database
          </span>
          <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Data Management
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface">
                Export Data
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Download a CSV file containing all your transaction records.
              </p>
            </div>
            <button className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary hover:shadow-md active:scale-95">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                download
              </span>
              Download CSV
            </button>
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            gavel
          </span>
          <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
            Legal
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant/30">
          <div className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low group/row">
            <p className="text-sm font-bold text-on-surface">
              Privacy Policy
            </p>
            <button className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container group">
              View Policy
              <span
                className="material-symbols-outlined group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                style={{ fontSize: "16px" }}
              >
                open_in_new
              </span>
            </button>
          </div>
          <div className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low group/row">
            <p className="text-sm font-bold text-on-surface">
              Terms of Use
            </p>
            <button className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container group">
              View Terms
              <span
                className="material-symbols-outlined group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                style={{ fontSize: "16px" }}
              >
                open_in_new
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone Section */}
      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[18px]">
            warning
          </span>
          <h3 className="font-label-caps text-label-caps text-error uppercase tracking-widest">
            Danger Zone
          </h3>
        </div>
        <div className="bg-surface-container-lowest border border-error/20 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between gap-4 bg-error-container/10 p-4 transition-colors hover:bg-error-container/30">
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-error-container">
                Delete Account
              </p>
              <p className="text-xs leading-5 text-on-surface-variant">
                Permanently remove your account and all associated budget data.
              </p>
            </div>
            <button className="shrink-0 rounded-lg bg-error px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#93000a] hover:shadow-md active:scale-95">
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* Branding Footer */}
      <footer className="mt-8 border-t border-outline-variant/30 pt-6 text-center">
        <p className="font-label-caps text-outline uppercase tracking-tighter opacity-50">
          Centra Institutional Suite v4.2.0
        </p>
      </footer>
    </div>
  );
};

export default Settings;
