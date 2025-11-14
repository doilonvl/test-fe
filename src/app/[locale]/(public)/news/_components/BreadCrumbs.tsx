"use client";

import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"; // dùng cùng UI với Products (shadcn)
import { ChevronRight } from "lucide-react";

export default function NewsBreadcrumbs({
  labels,
  title, // chỉ truyền khi ở trang detail
}: {
  labels: { home: string; news: string };
  title?: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm text-muted-foreground">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{labels.home}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <ChevronRight className="h-3.5 w-3.5" />
        </BreadcrumbSeparator>

        {title ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/news">{labels.news}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium truncate max-w-[220px]">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              {labels.news}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
