import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Header } from '../header';

interface Props {
  size?: number;
  onBack?: () => void;
  loadingText?: string;
}

export function ViewLoading({ size = 28, onBack, loadingText }: Props) {
  return (
    <>
      {onBack && <Header onBack={onBack} />}
      <div className="flex flex-col h-full w-full items-center justify-center gap-2">
        <AiOutlineLoading3Quarters
          className="animate-spin text-primary"
          size={size}
        />
        {loadingText && (
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        )}
      </div>
    </>
  );
}
