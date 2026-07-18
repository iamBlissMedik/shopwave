// Public surface of @shopwave/ui — import everything from here:
//   import { Button, DataTable, RevenueChart } from '@shopwave/ui';

export { Button, type ButtonProps } from './Button';
export { Input, fieldClasses, type InputProps } from './Input';
export { Card } from './Card';
export { Badge, type Tone } from './Badge';
export { SearchInput } from './SearchInput';
export { FilterBar, type FilterBarProps } from './FilterBar';
export { Pagination, type PaginationProps } from './Pagination';
export { DataTable, type Column, type DataTableProps } from './DataTable';
export { StatCard, type StatCardProps } from './StatCard';
export { Spinner, type SpinnerProps } from './Spinner';
export { CHART } from './chart';
export { RevenueChart, type TimePoint, type RevenueChartProps } from './charts/RevenueChart';
export { BarStat, type BarDatum, type BarStatProps } from './charts/BarStat';
export type { PaginationMeta } from './types';

// Domain-aware presentational components (shared across apps)
export { ProductCard, type ProductCardProps } from './ProductCard';
export { ProductForm } from './ProductForm';
export { DashboardShell, type DashboardNavItem } from './DashboardShell';
export { ErrorState } from './ErrorState';
export { LoadingState } from './LoadingState';

// Utilities
export { formatPrice, formatDate } from './format';
export { roleTone, statusTone } from './badgeTones';
export { fadeInUp, staggerContainer, badgePop, spring, easeOut } from './motion';
export { Stagger, RevealItem } from './Stagger';
