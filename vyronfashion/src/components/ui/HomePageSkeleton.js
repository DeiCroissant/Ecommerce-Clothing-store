/**
 * Skeleton loader for homepage
 * Prevents hydration mismatch by showing a neutral loading state
 * before the actual content (desktop or mobile) is rendered
 */
export default function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Logo or Brand */}
        <div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto animate-pulse" />
        
        {/* Loading Text */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-200 rounded mx-auto animate-pulse" />
          <div className="h-3 w-24 bg-zinc-100 rounded mx-auto animate-pulse" style={{ animationDelay: '150ms' }} />
        </div>

        {/* Optional: Simple loading spinner */}
        <div className="pt-4">
          <div className="w-8 h-8 border-3 border-zinc-300 border-t-zinc-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    </div>
  );
}
