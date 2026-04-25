import { walletPort } from '@/shared/channels';
import { prepareForHref } from '@/shared/prepare-for-href';
import { useMemo } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { useSearchParams } from 'react-router-dom';
import browser from 'webextension-polyfill';

export function PhishingWarningPage() {
  const [params] = useSearchParams();
  const rawUrl = params.get('url');
  const safeUrl = useMemo(
    () => (rawUrl ? prepareForHref(rawUrl) : null),
    [rawUrl]
  );
  const hostname = safeUrl ? safeUrl.hostname : null;

  const risks = [
    'Theft of recovery phrase or password',
    'Phishing & fake login forms',
    'Fake tokens or scams',
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          'linear-gradient(160deg, #1a0a0a 0%, #3b0f0f 50%, #1f1010 100%)',
      }}
    >
      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Icon + heading */}
        <div className="text-center pt-1">
          <div
            className="mx-auto mb-4 flex items-center justify-center text-2xl rounded-full"
            style={{
              width: 52,
              height: 52,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <LuTriangleAlert />
          </div>
          <h1
            className="text-2xl font-semibold leading-snug mb-1.5"
            style={{ color: '#f8f8f8' }}
          >
            Dangerous Site Blocked
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            This site has been flagged as malicious.
            <br />
            Your connection has been blocked.
          </p>
        </div>

        {/* Blocked URL */}
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider mb-1"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Blocked URL
          </p>
          <p
            className="text-sm font-medium truncate"
            style={{ color: '#fca5a5' }}
            title={hostname ?? ''}
          >
            {hostname}
          </p>
        </div>

        {/* Risk list */}
        <div
          className="rounded-xl px-4 py-4 flex flex-col gap-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Potential Risks
          </p>
          <ul className="flex flex-col gap-2.5">
            {risks.map((risk) => (
              <li
                key={risk}
                className="flex items-center gap-2.5 text-sm"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <span
                  className="rounded-full shrink-0"
                  style={{ width: 5, height: 5, background: '#f87171' }}
                />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-75"
            style={{ background: '#ffffff', color: '#1a0a0a' }}
            onClick={() => {
              browser.tabs.create({});
              window.close();
            }}
          >
            Back to Safety
          </button>

          <p
            className="text-center text-xs"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Understand the risks?{' '}
            <a
              href={safeUrl?.toString()}
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onClick={() => {
                if (safeUrl?.origin) {
                  walletPort.request('ignoreDappSecurityWarning', {
                    url: safeUrl.origin,
                  });
                }
              }}
            >
              Continue anyway
            </a>
          </p>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs pb-1"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Protected by Selvo × Blockaid
        </p>
      </div>
    </div>
  );
}
