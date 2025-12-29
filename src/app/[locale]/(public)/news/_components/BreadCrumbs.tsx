import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

type Props = {
  labels: { home: string; news: string };
  title?: string;
};

export default function NewsBreadcrumbs({ labels, title }: Props) {
  const isRoot = !title;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{labels.home}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {isRoot ? (
          <BreadcrumbItem>
            <BreadcrumbPage>{labels.news}</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/news">{labels.news}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {title ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[240px]">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
