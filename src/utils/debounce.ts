export type DebouncedFn<T extends (...args: any[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait = 300,
  immediate = false
): DebouncedFn<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const later = (context: any) => {
    timeout = null;
    if (!immediate && lastArgs) {
      fn.apply(context, lastArgs);
    }
    lastArgs = null;
  };

  const debounced = function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    const context = this;
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => later(context), wait);
    if (callNow) {
      fn.apply(context, args);
      lastArgs = null;
    }
  } as DebouncedFn<T>;

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      // immediately invoke with last args
      if (lastArgs) fn(...lastArgs);
      timeout = null;
      lastArgs = null;
    }
  };

  return debounced;
}
