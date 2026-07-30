import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="grid min-h-[70svh] content-center gap-6 py-16">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-14 w-full max-w-2xl" />
      <Skeleton className="h-6 w-full max-w-xl" />
      <div className="grid gap-4 pt-6 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-3xl" />
        ))}
      </div>
    </Container>
  );
}
