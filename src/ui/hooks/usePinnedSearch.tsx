import { useEffect, useRef, useState } from 'react';

export function usePinnedSearch() {
  const [searchPinned, setSearchPinned] = useState(false);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const filterOffsetTopRef = useRef<number>(0);

  useEffect(() => {
    if (searchRef.current) {
      filterOffsetTopRef.current = searchRef.current.offsetTop;
    }
  }, []);

  useEffect(() => {
    if (!scrollElement) return;

    const handleScroll = () => {
      const isPinned = scrollElement.scrollTop >= filterOffsetTopRef.current;
      setSearchPinned((prev) => (prev !== isPinned ? isPinned : prev));
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [scrollElement]);

  return { searchPinned, searchRef, scrollElement, setScrollElement };
}
