import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon: Icon = PackageSearch,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
