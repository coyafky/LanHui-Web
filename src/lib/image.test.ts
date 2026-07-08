import { describe, it, expect } from 'vitest';
import { getStoreImage, getCityImage, PLACEHOLDER_PATHS } from './image';

describe('image helpers', () => {
  it('getStoreImage: 使用 imagePath', () => {
    expect(getStoreImage({ imagePath: '/x.webp' })).toBe('/x.webp');
  });

  it('getStoreImage: imagePath=null → 占位图', () => {
    expect(getStoreImage({ imagePath: null })).toBe(PLACEHOLDER_PATHS.store);
  });

  it('getStoreImage: 未提供 imagePath → 占位图', () => {
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
