## 1. Baseline Audit

- [ ] 1.1 Confirm all imports of `@/lib/images`, relative `./images`, and `src/lib/images.ts`
- [ ] 1.2 Confirm current exports from `src/lib/images.ts`
- [ ] 1.3 Confirm `src/lib/image.ts` remains the entity image helper module

## 2. Rename Registry

- [ ] 2.1 Create `src/lib/image-registry.ts` with the current registry exports
- [ ] 2.2 Replace registry imports with `@/lib/image-registry`
- [ ] 2.3 Keep `src/lib/image.ts` unchanged except for comments if needed
- [ ] 2.4 Convert `src/lib/images.ts` to a temporary compatibility re-export or remove it after all imports are migrated

## 3. Import Guard

- [ ] 3.1 Add a check that rejects new imports from `@/lib/images`
- [ ] 3.2 Allow only the compatibility shim during the migration window
- [ ] 3.3 Document the intended import paths in the module comments

## 4. Tests

- [ ] 4.1 Add or update tests to verify `getImageProps()` output remains stable
- [ ] 4.2 Run existing `src/lib/image.test.ts`
- [ ] 4.3 Add a small import test or typecheck assertion for `@/lib/image-registry`

## 5. Verification

- [ ] 5.1 Run `npx vitest run src/lib/image.test.ts`
- [ ] 5.2 Run `npm run lint`
- [ ] 5.3 Run `npm run typecheck`
