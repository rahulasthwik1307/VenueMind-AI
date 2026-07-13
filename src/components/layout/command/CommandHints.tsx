function HintKey({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded bg-(--surface-3) border border-(--border-strong)/40 text-[9px] font-mono font-medium text-(--foreground-subtle)"
        >
          {k}
        </kbd>
      ))}
      <span className="text-[9px] text-(--foreground-subtle)/60 ml-0.5">{label}</span>
    </div>
  );
}

export function CommandHints() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-2 border-t border-(--border) bg-(--surface-2)"
      aria-hidden="true"
    >
      <HintKey keys={['↑', '↓']} label="navigate" />
      <HintKey keys={['↵']} label="select" />
      <HintKey keys={['Esc']} label="close" />
      <div className="ml-auto flex items-center gap-1 text-(--foreground-subtle)">
        <span className="text-[9px] font-mono">⌘K</span>
        <span className="text-[9px] text-(--foreground-subtle)/60">to toggle</span>
      </div>
    </div>
  );
}
