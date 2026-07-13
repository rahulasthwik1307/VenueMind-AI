interface CommandEmptyStateProps {
  query: string;
}

export function CommandEmptyState({ query }: CommandEmptyStateProps) {
  return (
    <li className="py-10 text-center" role="status">
      <p className="text-sm text-(--foreground-subtle)">No results for &ldquo;{query}&rdquo;</p>
      <p className="text-xs text-(--foreground-subtle)/60 mt-1">Try a section name or incident title</p>
    </li>
  );
}
