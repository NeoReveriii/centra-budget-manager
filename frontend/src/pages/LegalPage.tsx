import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { CentraBrand } from "@/components/CentraBrand";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
};

const effectiveDate = "August 13, 2026";
const privacyContact = import.meta.env.VITE_PRIVACY_CONTACT?.trim();

function LegalPage({ eyebrow, title, summary, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <CentraBrand variant="text" size="nav" surface="auto" to="/" alt="Centra home" />
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-on-surface-variant underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Centra
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-10 border-b border-outline-variant pb-10">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h1 className="text-balance text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant">{summary}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-outline">Effective {effectiveDate}</p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="scroll-mt-8">
              <h2 className="text-xl font-extrabold tracking-[-0.02em]">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-on-surface-variant">{paragraph}</p>
              ))}
              {section.items ? (
                <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-on-surface-variant">
                  {section.items.map((item) => <li key={item} className="list-disc pl-1">{item}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <aside className="mt-12 rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-extrabold">Privacy contact</h2>
              {privacyContact ? (
                <a className="mt-2 block break-all text-sm font-bold text-primary underline underline-offset-4" href={`mailto:${privacyContact}`}>
                  {privacyContact}
                </a>
              ) : (
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  This deployment has not configured a private privacy-contact address. The deployment owner must set
                  <code className="mx-1 rounded bg-surface-container-high px-1.5 py-0.5 text-xs">VITE_PRIVACY_CONTACT</code>
                  before accepting real user data. Account holders can still export or delete their data from Settings.
                </p>
              )}
            </div>
          </div>
        </aside>
      </article>
    </main>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal · Privacy"
      title="Privacy Notice"
      summary="This notice explains what Centra processes, why it is processed, which service providers receive it, and the choices available to account holders."
      sections={[
        {
          title: "1. Scope and responsibility",
          paragraphs: [
            "Centra is a personal budgeting application operated by the owner of the deployment you are using. That deployment owner is the personal information controller for data collected through the service. Centra is not a bank, e-wallet, payment network, lender, or financial adviser.",
            "The account illustrations are original Centra designs. Institution names, logos, payment-network marks, actual card photographs, card numbers, security codes, and payment credentials are not required and should not be entered.",
          ],
        },
        {
          title: "2. Data processed",
          items: [
            "Account data: name, email address, authentication identifiers, and any optional profile information you provide.",
            "Budget data: account labels, account types, balances, transactions, categories, savings goals, and dates you enter.",
            "Kwarta AI data: your prompt, saved chat history, and relevant wallet, transaction, and goal context when needed to answer a request.",
            "Operational data: security, error, and request metadata made available by the hosting and authentication providers.",
          ],
        },
        {
          title: "3. Why data is processed",
          items: [
            "Create and secure an account, restore a session, and provide requested features.",
            "Store, calculate, display, export, and delete personal budget records.",
            "Generate a Kwarta AI answer when you choose to submit a prompt.",
            "Protect the service, diagnose faults, and comply with applicable legal obligations.",
          ],
        },
        {
          title: "4. Service providers and disclosures",
          paragraphs: [
            "The deployment uses Neon for authentication and database services and Vercel for application hosting and serverless processing. When Kwarta AI cannot answer locally and the AI feature is configured, the prompt and the financial context shown above are sent to DeepSeek to generate a response. Do not use Kwarta AI for information you do not want processed by that provider.",
            "Data is not sold. It may be disclosed when required by law, to protect users and the service, or to processors acting on the deployment owner's documented instructions. Those providers may process data outside the Philippines under their own infrastructure and contractual safeguards.",
          ],
        },
        {
          title: "5. Retention and deletion",
          paragraphs: [
            "Budget records and saved chats are retained while the account is active. Using Delete Centra Data removes the Centra application profile and associated budget records from the primary application database. It does not promise deletion of the separate authentication-provider identity; signing in again may create a new empty Centra profile. Authentication-provider records, security logs, backups, or records required by law may follow separate limited retention periods.",
            "Export your transaction data before deletion if you want a copy. Deletion is irreversible from the application.",
          ],
        },
        {
          title: "6. Security",
          paragraphs: [
            "Centra uses authenticated, account-scoped API access and transport security provided by the deployment platform. No internet service can promise absolute security. Use a unique password, protect your email account, and never enter real card numbers, PINs, one-time passwords, or security codes.",
          ],
        },
        {
          title: "7. Your choices and rights",
          paragraphs: [
            "Depending on applicable law, including the Philippine Data Privacy Act, you may have rights to be informed, access, object, correct, erase or block data, obtain data portability, and seek redress. Settings provides transaction export and account deletion. Contact the deployment owner for requests that cannot be completed in the application.",
          ],
        },
        {
          title: "8. Changes",
          paragraphs: [
            "Material changes will be reflected by updating the effective date and, where appropriate, providing an in-product notice before the revised processing takes effect.",
          ],
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal · Terms"
      title="Terms of Use"
      summary="These terms govern access to this Centra deployment. Do not use the service if you do not agree to them."
      sections={[
        {
          title: "1. What Centra is",
          paragraphs: [
            "Centra is a budgeting and financial-information organizer. It does not hold or transfer money, connect to payment rails, issue cards, verify balances with a financial institution, or provide regulated financial, investment, tax, accounting, or legal advice.",
          ],
        },
        {
          title: "2. Accounts and acceptable use",
          items: [
            "Provide accurate registration information and keep your credentials confidential.",
            "Use only data you are entitled to enter and do not enter real card numbers, PINs, security codes, one-time passwords, or another person's private financial information.",
            "Do not probe, disrupt, automate abusive traffic, bypass access controls, upload malicious content, or use the service unlawfully.",
            "You are responsible for reviewing entries, calculations, exports, and decisions made from them.",
          ],
        },
        {
          title: "3. Institution names and account illustrations",
          paragraphs: [
            "Account illustrations are original Centra themes and are not reproductions of financial cards. Centra does not represent affiliation, endorsement, sponsorship, or partnership with any bank, e-wallet, card issuer, or payment network. If a user types an institution name into a personal label, it remains user-provided identification and does not change that relationship.",
          ],
        },
        {
          title: "4. Kwarta AI",
          paragraphs: [
            "Kwarta AI can make mistakes, omit context, or produce outdated information. Its output is general informational assistance, not professional advice. Verify important calculations and obtain qualified advice before making financial, investment, tax, credit, or legal decisions.",
          ],
        },
        {
          title: "5. Availability and third-party services",
          paragraphs: [
            "The service may change, be interrupted, or be withdrawn. Authentication, hosting, database, font, and optional AI features depend on third-party services governed by their own terms. The deployment owner does not promise uninterrupted or error-free availability.",
          ],
        },
        {
          title: "6. Intellectual property",
          paragraphs: [
            "Centra's original interface, artwork, text, and software remain subject to their applicable ownership and license terms. These terms do not grant rights to third-party names or marks. Do not copy or present Centra materials in a misleading way.",
          ],
        },
        {
          title: "7. Account suspension and deletion",
          paragraphs: [
            "Access may be limited for security, unlawful use, or material violation of these terms. You may delete application data through Settings. Some authentication records, security logs, backups, or legally required records may be retained separately as described in the Privacy Notice.",
          ],
        },
        {
          title: "8. Disclaimers and responsibility",
          paragraphs: [
            "To the extent permitted by applicable law, the service is provided as available without warranties that it will meet every need or that all output is accurate. Nothing in these terms excludes rights or liability that cannot lawfully be excluded. The deployment owner remains responsible for compliance obligations that apply to its operation of the service.",
          ],
        },
        {
          title: "9. Changes and disputes",
          paragraphs: [
            "Material changes will be identified by a new effective date and, where appropriate, an in-product notice. Applicable mandatory consumer, privacy, and other laws continue to apply. Contact the deployment owner first so concerns can be addressed promptly.",
          ],
        },
      ]}
    />
  );
}
