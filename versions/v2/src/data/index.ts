/**
 * @file Data module entry point for Lotus Grove Sanctuary (Tịnh Xá Sen Vàng)
 *
 * Vietnamese seed data is prioritized across the application.
 * Legacy English datasets from `seedData.ts` are deprecated.
 */

export * from './seedDataVI';

/**
 * @deprecated Legacy English seed data in `src/data/seedData.ts` is deprecated.
 * Import from `src/data/seedDataVI` or `src/data` instead.
 */
export * as seedDataDeprecatedEN from './seedData';
