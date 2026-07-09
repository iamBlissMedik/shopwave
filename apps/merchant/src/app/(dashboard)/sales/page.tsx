'use client';

import { useState } from 'react';
import { Badge, DataTable, statusTone, formatPrice, formatDate, type Column } from '@shopwave/ui';
import { useMerchantSales } from '@shopwave/hooks';
import type { Sale } from '@shopwave/types';

export default function MerchantSalesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMerchantSales(page);

  const columns: Column<Sale>[] = [
    { header: 'Order', cell: (s) => <span className="font-mono text-xs">#{s.orderId.slice(-8)}</span> },
    { header: 'Product', cell: (s) => s.product.name },
    { header: 'Customer', cell: (s) => s.customerName },
    { header: 'Qty', cell: (s) => s.quantity },
    { header: 'Revenue', cell: (s) => formatPrice(s.revenue) },
    { header: 'Status', cell: (s) => <Badge tone={statusTone[s.status]}>{s.status}</Badge> },
    { header: 'Date', cell: (s) => formatDate(s.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sales</h1>
        <p className="text-sm text-muted">Line items from customer orders that include your products.</p>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        emptyMessage="No sales yet."
        meta={data?.meta}
        onPageChange={setPage}
      />
    </div>
  );
}
