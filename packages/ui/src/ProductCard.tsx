'use client';

import { ShoppingCart } from 'lucide-react';
import type { Product } from '@shopwave/types';
import { Button } from './Button';
import { formatPrice } from './format';
import { DefaultImage, DefaultLink } from './adapters';
import type { ImageLike, LinkLike } from './types';

export interface ProductCardProps {
  product: Product;
  /** Product detail href. */
  href: string;
  /** Whether to show the Add-to-cart button (customers only). */
  canBuy?: boolean;
  /** Load the image eagerly — set for cards in the first visible row (LCP candidates). */
  eager?: boolean;
  /** Add-to-cart in flight. */
  isAdding?: boolean;
  onAdd?: () => void;
  /** Injected by the app (Next `Link`); falls back to `<a>` for Storybook. */
  LinkComponent?: LinkLike;
  /** Injected by the app (Next `Image`); falls back to `<img>` for Storybook. */
  ImageComponent?: ImageLike;
}

/**
 * Presentational product tile used by the storefront. Owns no data — the app
 * wires `onAdd`/`canBuy` from hooks and passes Next's `Link`/`Image`. Hover
 * lifts the card and slowly zooms the image (CSS transforms only, so it stays
 * on the compositor). Fills its grid cell, so place it in a `Stagger` grid.
 */
export function ProductCard({
  product,
  href,
  canBuy = true,
  isAdding = false,
  eager = false,
  onAdd,
  LinkComponent: Link = DefaultLink,
  ImageComponent: Image = DefaultImage,
}: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-card">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-surface-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">
          {product.category}
        </span>
        <Link
          href={href}
          className="mt-1 line-clamp-1 font-display text-base font-semibold text-foreground transition-colors group-hover:text-brand"
        >
          {product.name}
        </Link>
        {product.merchant?.storeName && (
          <span className="mt-0.5 text-xs text-muted">by {product.merchant.storeName}</span>
        )}
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-foreground sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {canBuy && (
            <Button
              onClick={onAdd}
              disabled={outOfStock}
              isLoading={isAdding}
              size="sm"
              // Icon-only on narrow cards, so the accessible name carries the label.
              aria-label={outOfStock ? undefined : `Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} aria-hidden />
              {outOfStock ? 'Sold out' : <span className="hidden sm:inline">Add</span>}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
