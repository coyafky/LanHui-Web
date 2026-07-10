## Why

`src/lib/image.ts` and `src/lib/images.ts` sit next to each other with nearly identical names but different responsibilities. `image.ts` resolves entity image paths and placeholders. `images.ts` is an image asset registry. This naming collision is easy to mis-import and becomes riskier as image handling expands.

Current usage is small: `src/lib/image.ts` has tests and entity image helpers, while `src/lib/images.ts` is currently imported by `src/components/OptimizedImage.tsx` for the `ImageAsset` type. This makes the rename low-risk and high-clarity.

## What

- Rename the asset registry module from `src/lib/images.ts` to `src/lib/image-registry.ts`.
- Keep `src/lib/image.ts` unchanged as the entity image path helper module.
- Update imports so registry consumers use `@/lib/image-registry`.
- Optionally keep `src/lib/images.ts` as a temporary compatibility re-export with a deprecation comment.
- Add an import guard so new code does not import the ambiguous `@/lib/images` path.

## Impact

- Affected files:
  - `src/lib/images.ts`
  - `src/lib/image-registry.ts`
  - `src/lib/image.ts`
  - `src/components/OptimizedImage.tsx`
  - image-related tests or lint guards
- Behavior risk:
  - Should be import-only; rendered image props and asset data must remain unchanged.
- Verification:
  - `npx vitest run src/lib/image.test.ts`
  - `npm run lint`
  - `npm run typecheck`
