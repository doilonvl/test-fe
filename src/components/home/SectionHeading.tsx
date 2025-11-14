import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  layout?: "split" | "stack";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  layout = "split",
}: SectionHeadingProps) {
  const isSplit = layout === "split";
  return (
    <div className="space-y-3">
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
          {eyebrow}
        </p>
      ) : null}
      <div
        className={
          isSplit
            ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            : "space-y-3"
        }
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 mb-5 text-sm text-gray-600">{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className={isSplit ? "flex shrink-0" : ""}>{action}</div>
        ) : null}
      </div>
    </div>
  );
}
