export function LiveBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-navy-900/10 bg-navy-50 px-4 py-1.5 text-sm font-medium text-navy-900">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-600 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success-600" />
      </span>
      {children}
    </span>
  )
}
