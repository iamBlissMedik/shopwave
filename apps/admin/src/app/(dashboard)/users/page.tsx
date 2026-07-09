'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge, Button, DataTable, FilterBar, roleTone, formatDate, type Column } from '@shopwave/ui';
import { useAdminUsers, useUpdateUserRole, useDeleteUser, useAuth, type AdminUserFilters } from '@shopwave/hooks';
import type { AdminUser, Role } from '@shopwave/types';

const ROLES: Role[] = ['USER', 'MERCHANT', 'ADMIN'];
const selectClass = 'rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-brand/40';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [filters, setFilters] = useState<AdminUserFilters>({ page: 1, limit: 10 });
  const { data, isLoading } = useAdminUsers(filters);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const patch = (p: Partial<AdminUserFilters>) =>
    setFilters((prev) => ({ ...prev, ...p, page: 'page' in p ? p.page! : 1 }));

  const columns: Column<AdminUser>[] = [
    {
      header: 'User',
      cell: (u) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-muted">{u.email}</p>
        </div>
      ),
    },
    { header: 'Store', cell: (u) => u.storeName ?? <span className="text-muted">—</span> },
    { header: 'Products', cell: (u) => u._count.products },
    { header: 'Orders', cell: (u) => u._count.orders },
    { header: 'Joined', cell: (u) => formatDate(u.createdAt) },
    {
      header: 'Role',
      cell: (u) =>
        u.id === me?.id ? (
          <Badge tone={roleTone[u.role]}>{u.role} (you)</Badge>
        ) : (
          <select
            className={selectClass}
            value={u.role}
            onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as Role })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (u) =>
        u.id === me?.id ? null : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(`Delete ${u.name}? This cannot be undone.`)) deleteUser.mutate(u.id);
            }}
          >
            <Trash2 size={14} className="text-danger" />
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <FilterBar
        search={filters.search ?? ''}
        onSearch={(search) => patch({ search: search || undefined })}
        searchPlaceholder="Search name or email…"
      >
        <select
          value={filters.role ?? ''}
          onChange={(e) => patch({ role: (e.target.value || undefined) as Role | undefined })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="No users found."
        meta={data?.meta}
        onPageChange={(page) => patch({ page })}
      />
    </div>
  );
}
