export function classNames(...classes: (string | boolean | undefined | null | { [key: string]: boolean })[]): string {
  return classes
    .filter((cls): cls is string | { [key: string]: boolean } => Boolean(cls))
    .map(cls => {
      if (typeof cls === 'string') return cls;
      return Object.entries(cls)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(' ');
    })
    .join(' ');
} 