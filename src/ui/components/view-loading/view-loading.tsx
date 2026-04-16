import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface Props {
  size?: string;
}

export function ViewLoading({ size = '24px' }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center py-10">
      <AiOutlineLoading3Quarters className="animate-spin text-primary" size={size} />
    </div>
  );
}
