import {
  SortSelectorComponent,
  type SortOption,
} from "./sort-selector.component";

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SortSelector({
  value,
  onChange,
  open,
  onOpenChange,
}: SortSelectorProps) {
  return (
    <SortSelectorComponent
      open={open}
      onOpenChange={onOpenChange}
      value={value}
      onChange={onChange}
    />
  );
}

export type { SortOption };
