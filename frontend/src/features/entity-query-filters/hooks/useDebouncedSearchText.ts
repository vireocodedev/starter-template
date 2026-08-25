import React from "react";

export function useDebouncedSearchText(initialValue: string, delay = 300) {
  const [input, setInput] = React.useState(initialValue);
  const [committed, setCommitted] = React.useState(initialValue.trim());

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setCommitted(input.trim()), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, input]);

  const commitNow = React.useCallback(
    (value = input) => {
      const normalized = value.trim();
      setInput(value);
      setCommitted(normalized);
    },
    [input],
  );

  const clear = React.useCallback(() => {
    setInput("");
    setCommitted("");
  }, []);

  return React.useMemo(
    () => ({ input, committed, setInput, commitNow, clear }) as const,
    [clear, commitNow, committed, input],
  );
}
