import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-100", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="pt-6 border-t border-zinc-50 flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-100 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-start">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-4 p-4 items-center border-b border-zinc-50">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-none border-zinc-50">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-zinc-100">
        <Skeleton className="h-32 w-32 rounded-[40px]" />
        <div className="flex-1 space-y-4 text-center md:text-left">
          <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
          <div className="flex gap-2 justify-center md:justify-start">
             <Skeleton className="h-6 w-20 rounded-full" />
             <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
           <Skeleton className="h-64 w-full rounded-[32px]" />
           <Skeleton className="h-48 w-full rounded-[32px]" />
        </div>
        <div className="space-y-6">
           <Skeleton className="h-80 w-full rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
