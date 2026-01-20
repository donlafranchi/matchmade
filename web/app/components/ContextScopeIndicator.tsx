type ContextScopeIndicatorProps = {
  currentContext: string;
};

export function ContextScopeIndicator({
  currentContext,
}: ContextScopeIndicatorProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-700">
          Current context:
        </span>
        <span className="rounded-full bg-black px-3 py-1 text-sm font-medium capitalize text-white">
          {currentContext}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Some profile fields (like values and lifestyle) are shared across all
        contexts. Intent fields below are specific to {currentContext}{" "}
        relationships.
      </p>
    </div>
  );
}
