import { describe, it, expect } from 'vitest';
import { parseProductFilters, PRODUCTS_PER_PAGE } from '../queries';

describe('parseProductFilters', () => {
  it('applies defaults for an empty URL', () => {
    expect(parseProductFilters(new URLSearchParams())).toEqual({
      page: 1,
      limit: PRODUCTS_PER_PAGE,
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: 'newest',
    });
  });

  it('reads every filter from the URL (prices in cents)', () => {
    const filters = parseProductFilters(
      new URLSearchParams(
        'page=2&search=desk&category=Audio&minPrice=1000&maxPrice=5000&sort=price_asc',
      ),
    );
    expect(filters).toMatchObject({
      page: 2,
      search: 'desk',
      category: 'Audio',
      minPrice: 1000,
      maxPrice: 5000,
      sort: 'price_asc',
    });
  });

  it('ignores tampered values instead of sending them to the API', () => {
    const filters = parseProductFilters(new URLSearchParams('page=-4&sort=evil&minPrice=abc'));
    expect(filters).toMatchObject({ page: 1, sort: 'newest', minPrice: undefined });
  });
});
