export type AdapterSlot<TAdapter extends object> = {
  adapter: TAdapter;
  configure: (adapter: TAdapter) => void;
  reset: () => void;
};

/**
 * Keeps feature imports stable while allowing the application composition root to
 * replace a transport implementation before React renders.
 */
export function createAdapterSlot<TAdapter extends object>(defaultAdapter: TAdapter): AdapterSlot<TAdapter> {
  let current = defaultAdapter;
  const adapter = new Proxy(defaultAdapter, {
    get: (_target, property) => {
      const value = Reflect.get(current, property);
      return typeof value === "function" ? value.bind(current) : value;
    },
  });

  return {
    adapter,
    configure: next => {
      current = next;
    },
    reset: () => {
      current = defaultAdapter;
    },
  };
}
