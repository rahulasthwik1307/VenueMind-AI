interface EmptyProps {
  message?: string;
  description?: string;
}

export function Empty({ message = 'No data available', description }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-2 text-center border-2 border-dashed border-zinc-200 rounded-xl">
      <div className="text-lg font-medium text-zinc-700">{message}</div>
      {description && <p className="text-sm text-zinc-500 max-w-sm">{description}</p>}
    </div>
  );
}
