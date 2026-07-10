## Module Boundaries

Keep the two image modules separate by responsibility:

- `src/lib/image.ts`
  - resolves store/city image paths from entity fields
  - owns placeholder path fallback behavior
  - remains covered by `src/lib/image.test.ts`

- `src/lib/image-registry.ts`
  - owns static registered assets such as `homeImages`, `productImages`, `brandImages`, `storeImages`, `certImages`
  - exports `ImageAsset` and `getImageProps()`

`src/lib/images.ts` is too ambiguous and should not be used for new imports.

## Migration Strategy

1. Move the existing registry exports to `src/lib/image-registry.ts`.
2. Update direct imports from `@/lib/images` to `@/lib/image-registry`.
3. Keep `src/lib/images.ts` as a temporary re-export if any downstream tooling or branches still import it.
4. Add a guard that fails on new imports from `@/lib/images`, except inside the compatibility shim.

## Compatibility

The rename MUST NOT change the shape or values of exported assets:

- `ImageAsset`
- `homeImages`
- `productImages`
- `brandImages`
- `storeImages`
- `certImages`
- `getImageProps()`

If a compatibility shim remains, it MUST NOT duplicate data; it must only re-export from `image-registry.ts`.
