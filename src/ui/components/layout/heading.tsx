export function LayoutHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="inline-flex flex-col gap-1.5">
      <h1 className="text-xl font-medium">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
