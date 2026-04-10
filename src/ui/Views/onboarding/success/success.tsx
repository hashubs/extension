import { Button } from '@/ui/ui-kit';
import { useCallback } from 'react';
import { MdShare } from 'react-icons/md';
import browser from 'webextension-polyfill';
import { SectionHeader } from '../section-header';

export function Success() {
  const openWallet = useCallback(() => {
    browser.action.openPopup();
  }, []);

  return (
    <>
      <SectionHeader
        title="You're all set!"
        description="Your extension is ready. Pin it to your browser for quick access to your assets and seamless transactions."
      />

      <div className="bg-surface p-6 rounded-xl border border-black/8 mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-base font-bold text-on-surface mb-1">
              Refer a friend
            </h3>
            <p className="text-sm text-on-surface-variant leading-normal mb-4">
              Share the security with others and earn premium rewards.
            </p>
            <button className="inline-flex items-center gap-2 bg-surface-container-highest text-on-surface text-sm font-bold px-4 py-2 rounded-lg border-none cursor-pointer transition-colors duration-200 hover:bg-surface-dim">
              <span>Invite Now</span>
              <MdShare style={{ fontSize: '18px' }} />
            </button>
          </div>
          <div
            className="w-24 h-24 rounded-lg bg-cover bg-center shrink-0"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDf-eyLRdSVB4PAV7WTeYGfT8hfafsRi60Kg3Jc9A6qL1MeER23Zm43fHP8xdAxvYHPuBLgh9PgPafwbvUmHS_4gkfwi0gnafaqQ1-VPudJeSMiEI_q87DpdeZkw5QwPeVvw9d2rEwx0vUUIC8muBRE_IfvDWwzyaGZCWd7w3-jQEOKbtkEdzXM5A2HO2r0fExK4XvR-WG3hg1E-sUs986eWB09tnCDOzHcrmygWFiM1MRfWypSG31CrELjm2lYOPgNXIoevULW5p8")`,
            }}
          />
        </div>
      </div>

      <div className="mt-auto pt-8">
        <Button
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          onClick={openWallet}
        >
          Go to Wallet
        </Button>
      </div>
    </>
  );
}
