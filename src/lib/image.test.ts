import { describe, it, expect } from 'vitest';
import { getStoreImage, getCityImage, PLACEHOLDER_PATHS } from './image';

describe('image helpers', () => {
  it('getStoreImage: imagePath 优先', () => {
    expect(getStoreImage({ imagePath: '/x.webp' })).toBe('/x.webp');
    expect(getStoreImage({ imagePath: '/x.webp', imageUrl: '/y.jpg' })).toBe('/x.webp');
  });

  it('getStoreImage: imagePath=null → 回落 imageUrl', () => {
    expect(getStoreImage({ imagePath: null, imageUrl: '/old.jpg' })).toBe('/old.jpg');
  });

  it('getStoreImage: 都为 null → 占位图', () => {
    expect(getStoreImage({ imagePath: null, imageUrl: null })).toBe(PLACEHOLDER_PATHS.store);
    expect(getStoreImage({})).toBe(PLACEHOLDER_PATHS.store);
  });

  it('getCityImage: 传入 provinceImageUrl 直接返回', () => {
    expect(getCityImage({}, 'p.png')).toBe('p.png');
    expect(getCityImage({ id: 1 }, '/prov.webp')).toBe('/prov.webp');
  });

  it('getCityImage: null → 占位图', () => {
    expect(getCityImage({}, null)).toBe(PLACEHOLDER_PATHS.province);
    expect(getCityImage({}, undefined as unknown as null)).toBe(PLACEHOLDER_PATHS.province);
  });
});
