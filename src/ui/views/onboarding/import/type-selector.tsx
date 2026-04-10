import { FaKey } from 'react-icons/fa6';
import { MdChevronRight, MdSync } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../section-header';
import { ONBOARDING_ROUTES } from '../routes';

export function TypeSelector() {
  const navigate = useNavigate();

  return (
    <>
      <SectionHeader
        title="Import wallet"
        description="Select a method to import your existing wallet."
      />

      <div className="flex flex-col gap-3 mb-8">
        <button
          className="group flex items-center gap-4 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-5 py-4.5 cursor-pointer text-left transition-all duration-200 hover:bg-surface-container hover:border-primary-container hover:shadow-[0_2px_12px_rgba(15,61,62,0.08)]"
          onClick={() => navigate(ONBOARDING_ROUTES.IMPORT.PHRASE)}
          type="button"
        >
          <div className="w-10 h-10 rounded-[0.625rem] bg-surface-container-low text-primary-container flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-primary-container group-hover:text-on-primary">
            <MdSync size={22} />
          </div>
          <div className="flex-1 flex flex-col gap-[0.2rem]">
            <span className="text-[0.9375rem] font-bold text-on-surface">
              Recovery Phrase
            </span>
            <span className="text-[0.8125rem] text-on-surface-variant">
              12 or 24 words seed phrase
            </span>
          </div>
          <MdChevronRight size={24} className="text-on-surface-variant" />
        </button>

        <button
          className="group flex items-center gap-4 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl px-5 py-4.5 cursor-pointer text-left transition-all duration-200 hover:bg-surface-container hover:border-primary-container hover:shadow-[0_2px_12px_rgba(15,61,62,0.08)]"
          onClick={() => navigate(ONBOARDING_ROUTES.IMPORT.PRIVATE_KEY)}
          type="button"
        >
          <div className="w-10 h-10 rounded-[0.625rem] bg-surface-container-low text-primary-container flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-primary-container group-hover:text-on-primary">
            <FaKey size={18} />
          </div>
          <div className="flex-1 flex flex-col gap-[0.2rem]">
            <span className="text-[0.9375rem] font-bold text-on-surface">
              Private Key
            </span>
            <span className="text-[0.8125rem] text-on-surface-variant">
              64-character hex string
            </span>
          </div>
          <MdChevronRight size={24} className="text-on-surface-variant" />
        </button>
      </div>

      <div className="inline-flex flex-wrap justify-between pt-6 border-t border-muted-foreground/10 mt-auto">
        <span className="text-[0.8125rem] font-semibold text-muted-foreground/80">
          🛡 Independently audited
        </span>
        <span className="text-[0.8125rem] font-semibold text-muted-foreground/80">
          🔐 Self custodial
        </span>
      </div>
    </>
  );
}
