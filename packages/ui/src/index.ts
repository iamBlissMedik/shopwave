// Public surface of @shopwave/ui — import everything from here:
//   import { Button, DataTable, RevenueChart } from '@shopwave/ui';

export { Button, buttonClasses, type ButtonProps } from './Button';
export { Input, fieldClasses, type InputProps } from './Input';
export { Select, type SelectProps } from './Select';
export { Card } from './Card';
export { Badge, type Tone } from './Badge';
export { SearchInput } from './SearchInput';
export { FilterBar, type FilterBarProps } from './FilterBar';
export { Pagination, type PaginationProps } from './Pagination';
export { DataTable, type Column, type DataTableProps } from './DataTable';
export { StatCard, type StatCardProps } from './StatCard';
export { Spinner, type SpinnerProps } from './Spinner';
export { CHART } from './chart';
// Charts live on their own entry, `@shopwave/ui/charts`, so they can be lazy-loaded.
export { ChartSkeleton } from './ChartSkeleton';
export type { PaginationMeta, LinkLike, ImageLike } from './types';

// Domain-aware presentational components (shared across apps)
export { ProductCard, type ProductCardProps } from './ProductCard';
export { ProductForm } from './ProductForm';
export { DashboardShell, type DashboardNavItem } from './DashboardShell';
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { ErrorState } from './ErrorState';
export { LoadingState } from './LoadingState';

// Utilities
export { formatPrice, formatDate } from './format';
export { roleTone, statusTone } from './badgeTones';
export { easeOut } from './motion';
export { Stagger } from './Stagger';
