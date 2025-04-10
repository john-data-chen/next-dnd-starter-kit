'use client';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import React from 'react';

export function Breadcrumbs() {
  const { items, rootLink } = useBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.length === 1 ? (
          <BreadcrumbItem>
            <BreadcrumbLink href={items[0].link}>
              {items[0].title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbEllipsis href={rootLink} />
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <BreadcrumbSeparator />
              <BreadcrumbLink href={items[items.length - 1].link}>
                {items[items.length - 1].title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="hidden md:flex">
              {items.map((item, index) => (
                <React.Fragment key={item.link}>
                  <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                  {index < items.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
