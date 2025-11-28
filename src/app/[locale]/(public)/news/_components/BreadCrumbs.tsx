import { Link } from "@/i18n/navigation";

type Props = {
  labels: { home: string; news: string };
  title?: string;
};

export default function NewsBreadcrumbs({ labels, title }: Props) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <li>
          <Link
            href="/"
            className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded"
          >
            {labels.home}
          </Link>
        </li>
        <li aria-hidden className="text-slate-400">
          /
        </li>
        <li>
          <Link
            href="/news"
            className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded"
          >
            {labels.news}
          </Link>
        </li>
        {title ? (
          <>
            <li aria-hidden className="text-slate-400">
              /
            </li>
            <li className="text-slate-500">{title}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}
