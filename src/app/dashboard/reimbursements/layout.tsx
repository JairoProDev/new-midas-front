'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

export default function ReimbursementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
} 