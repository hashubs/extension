import type React from 'react';
import { useLayoutEffect, useRef } from 'react';

function setStyleProperty(node: HTMLElement, key: string, value: unknown) {
  if (key.startsWith('--')) {
    node.style.setProperty(key, value as string);
  } else {
    // @ts-ignore
    node.style[key] = value;
  }
}

function getStyleProperty(node: HTMLElement, key: string) {
  if (key.startsWith('--')) {
    return node.style.getPropertyValue(key);
  } else {
    // @ts-ignore key is keyof CSSProperties
    return node.style[key];
  }
}

export function useBodyStyle(style: React.CSSProperties) {
  const prevValuesRef = useRef<React.CSSProperties>({});

  useLayoutEffect(() => {
    for (const untypedKey in style) {
      const key = untypedKey as keyof typeof style;
      if (key in prevValuesRef.current === false) {
        // @ts-ignore
        prevValuesRef.current[key] = getStyleProperty(document.body, key);
      }
      setStyleProperty(document.body, key, style[key]);
    }
  }, [style]);
  useLayoutEffect(() => {
    const prevValues = prevValuesRef.current;
    return () => {
      for (const untypedKey in prevValues) {
        const key = untypedKey as keyof typeof style;
        setStyleProperty(document.body, key, prevValues[key]);
      }
    };
  }, []);
}
