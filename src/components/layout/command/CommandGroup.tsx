interface CommandGroupProps {
  label: string;
}

export function CommandGroup({ label }: CommandGroupProps) {
  return (
    <li
      className="px-2 pt-1 pb-0.5"
      role="presentation"
      aria-hidden="true"
    >
      <span className="text-[9px] font-bold uppercase tracking-widest text-(--foreground-subtle)">
        {label}
      </span>
    </li>
  );
}
