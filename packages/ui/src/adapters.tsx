import type { ImageLike, LinkLike } from './types';

/** Plain `<a>` fallback for components whose app didn't inject a router link. */
export const DefaultLink: LinkLike = ({ href, className, children }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

/** Plain `<img>` fallback for components whose app didn't inject an image component. */
export const DefaultImage: ImageLike = ({ src, alt, className, loading = 'lazy' }) => (
  <img src={src} alt={alt} className={className} loading={loading} />
);
