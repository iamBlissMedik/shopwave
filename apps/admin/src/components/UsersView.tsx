'use client';

import { Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  DataTable,
  FilterBar,
  Select,
  formatDate,
  roleTone,
  type Column,
} from '@shopwave/ui';
import { useAuth, useUrlFilters } from '@shopwave/hooks';
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from '@/hooks';
import { ROLES, parseUserFilters } from '@/queries';
import type { AdminUser, Role } from '@shopwave/types';

/** User directory: search, role filter, role changes and deletion. */
export function UsersView() {
  const { user: me } = useAuth();
  const [filters, setFilters] = useUrlFilters(parseUserFilters);
  const { data, isLoading, isPlaceholderData } = useAdminUsers(filters);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

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
          <Select
            aria-label={`Role for ${u.name}`}
            value={u.role}
            disabled={updateRole.isPending}
            onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as Role })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
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
            aria-label={`Delete ${u.name}`}
            disabled={deleteUser.isPending}
            onClick={() => {
              if (confirm(`Delete ${u.name}? This cannot be undone.`)) deleteUser.mutate(u.id);
            }}
          >
            <Trash2 size={14} aria-hidden className="text-danger" />
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <FilterBar
        search={filters.search ?? ''}
        onSearch={(search) => setFilters({ search: search || undefined })}
        searchPlaceholder="Search name or email…"
      >
        <Select
          aria-label="Role"
          value={filters.role ?? ''}
          onChange={(e) => setFilters({ role: (e.target.value || undefined) as Role | undefined })}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        isFetching={isPlaceholderData}
        emptyMessage="No users found."
        meta={data?.meta}
        onPageChange={(page) => setFilters({ page })}
      />
    </div>
  );
}
