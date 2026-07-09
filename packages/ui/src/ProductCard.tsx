'use client';

import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { Product } from '@shopwave/types';
import { Button } from './Button';
import { formatPrice } from './format';
import { fadeInUp } from './motion';

type LinkLike = ComponentType<{ href: string; className?: string; children: ReactNode }>;
type ImageLike = ComponentType<{ src: string; alt: string; className?: string }>;

export interface ProductCardProps {
  product: Product;
  /** Product detail href. */
  href: string;
  /** Whether to show the Add-to-cart button (customers only). */
  canBuy?: boolean;
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
 * wires `onAdd`/`canBuy` from hooks and passes Next's `Link`/`Image`. Animated:
 * a spring hover-lift plus an image zoom; designed to be a stagger child under a
 * `staggerContainer` grid.
 */
export function ProductCard({
  product,
  href,
  canBuy = true,
  isAdding = false,
  onAdd,
  LinkComponent,
  ImageComponent,
}: ProductCardProps) {
  const Link: LinkLike = LinkComponent ?? (({ href, className, children }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ));
  const Image: ImageLike =
    ImageComponent ?? (({ src, alt, className }) => <img src={src} alt={alt} className={className} />);

  const outOfStock = product.stock <= 0;

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-shadow duration-300 hover:shadow-card"
    >
      <Link href={href} className="relative block aspect-square overflow-hidden bg-surface-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">{product.category}</span>
        <Link href={href} className="mt-1 line-clamp-1 font-display text-base font-semibold text-foreground transition-colors group-hover:text-brand">
          {product.name}
        </Link>
        {product.merchant?.storeName && (
          <span className="mt-0.5 text-xs text-muted">by {product.merchant.storeName}</span>
        )}
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
          {canBuy && (
            <Button onClick={onAdd} disabled={outOfStock} isLoading={isAdding} size="sm">
              <ShoppingCart size={16} />
              {outOfStock ? 'Sold out' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
