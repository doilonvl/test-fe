'use client';

import { Link } from '@/i18n/navigation';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from '@/components/ui/breadcrumb';

type Crumb = { title: string; slug: string };

export default function Breadcrumbs({
  labels,
  nodeTitle,
  ancestors = [],
  isRootProducts = false,
}: {
  labels: { home: string; products: string };
  nodeTitle?: string;
  ancestors?: Crumb[];
  /** Trang gốc Products: hiển thị "Home / Products & services" và dừng lại */
  isRootProducts?: boolean;
}) {
  // Nếu BE lỡ trả phần tử cuối trùng node hiện tại → bỏ bớt
  const cleanAnc =
    nodeTitle && ancestors.at(-1)?.title === nodeTitle
      ? ancestors.slice(0, -1)
      : ancestors;

  const segs: string[] = [];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{labels.home}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Products & services */}
        {isRootProducts ? (
          // Ở trang gốc /products: coi Products là trang hiện tại
          <BreadcrumbItem>
            <BreadcrumbPage>
              {labels.products}
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">{labels.products}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {/* Ancestors */}
        {!isRootProducts &&
          cleanAnc.map((a, i) => {
            segs.push(a.slug);
            return (
              <span key={`${a.slug}-${i}`} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={{ pathname: '/products/[[...segments]]', params: { segments: [...segs] } }}
                      className="truncate max-w-[180px]"
                    >
                      {a.title}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </span>
            );
          })}

        {/* Current node */}
        {!isRootProducts && nodeTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[220px]">
                {nodeTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
