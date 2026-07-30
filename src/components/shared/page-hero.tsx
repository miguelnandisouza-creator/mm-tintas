import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  className,
  children,
}: PageHeroProps) {
  return (
    <section className={cn("border-b bg-card py-16 sm:py-20", className)}>
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
