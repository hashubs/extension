import { cn } from '@/ui/lib/utils';
import { Button } from '@/ui/ui-kit';
import { ReactNode } from 'react';
import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';

interface PageLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  backIconType?: 'arrow' | 'close';
  customRightPanel?: ReactNode;
}

export function PageLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  backIconType = 'arrow',
  customRightPanel,
}: PageLayoutProps) {
  const showNav = currentStep !== undefined && totalSteps !== undefined;

  return (
    <div className="flex flex-col md:flex-row relative w-full h-screen overflow-auto bg-[linear-gradient(135deg,#002627_0%,#0f3d3e_100%)]">
      <div className="absolute inset-0 opacity-[0.1] pointer-events-none">
        <img
          alt="onboarding"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBogEGs1M4nHGLIcLi-o-4VZpK-0GghAcNPkNgO99fFGVGXKibYVxaJZtewXTnnpdyWz9bylU9Y5hHR7kBXcbTM4Z8GcfsTU9vNTZrLW5qJV5XNSq_f50Y22wEEJkksQpWx5xebzSztEEX3x77ejClDryfbcGR9ym5cbHzL5aao1EdAtw8ksOgnG6wZwde1mGSwfyvIk2F6E8FAsm2wa0EODYEsVeQD8KctySl1zR_aSauBJ7L1Z3SpQUtRyJS7kJhAwoUXUjS2_SI"
        />
      </div>
      <div className="flex w-full h-full max-w-5xl mx-auto p-4 md:p-6">
        <div className="relative w-full h-full rounded-[20px] overflow-y-auto bg-surface dark:bg-black/50 dark:backdrop-blur-xl flex flex-col shrink-0 z-1 md:w-[500px]">
          {(onBack || showNav) && (
            <div className="sticky top-0 z-99 flex justify-between items-center px-4 pt-4 pb-2.5 md:px-12 md:pt-12 md:pb-4">
              {onBack && (
                <Button
                  variant="blank"
                  icon={backIconType === 'close' ? MdClose : IoArrowBackOutline}
                  onClick={onBack}
                  disabled={!onBack}
                  iconOnly
                  iconOnlySize="md"
                  className="text-on-surface-variant rounded-md bg-surface-container-highest"
                />
              )}
              {showNav && (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps! }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 rounded-full',
                          i < currentStep!
                            ? 'bg-primary-container'
                            : 'bg-surface-container-highest',
                          i === 1 ? 'w-10' : 'w-6'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="w-full h-full flex-1 overflow-hidden">
            <div className="w-full h-full flex flex-col p-4 md:p-12 flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>

        <div className="hidden md:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 rounded-r-[20px]">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[rgba(163,207,207,0.1)] rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-5 left-[-5%] w-80 h-80 bg-black/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 w-full max-w-96 flex flex-col h-full justify-between">
            {customRightPanel ? (
              customRightPanel
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-[-0.05em] mb-1">
                    Monolith
                  </h2>
                  <p className="text-base text-white/60">
                    Institutional Grade Security
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mt-auto">
                  <p className="text-white/80 text-sm m-0 mb-4 leading-relaxed">
                    "Building the foundation of the decentralised economy
                    through architectural stability."
                  </p>
                  <button className="bg-transparent border-none cursor-pointer text-[#a3cfcf] font-bold text-xs flex items-center gap-2 p-0 group">
                    Support
                    <IoArrowForwardOutline className="text-[18px] transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
