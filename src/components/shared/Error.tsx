interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function Error({ message = 'An unexpected error occurred', onRetry }: ErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 space-y-4 text-center"
      role="alert"
    >
      <div className="text-red-500 font-semibold">⚠️ Error</div>
      <p className="text-sm text-zinc-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}
