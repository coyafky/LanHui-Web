import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandTab } from './BrandTab';

/**
 * BrandTab 组件测试 (U1-U3)
 */

describe('BrandTab', () => {
  it('U1: mount 后, 渲染 zh、en、slogan、phone 等字段标签 (断言 ≥ 10 个字段标签)', () => {
    render(<BrandTab />);
    const expectedLabels = [
      '中文名',
      '英文名',
      'Slogan',
      '简介',
      '成立年份',
      '联系电话',
      '拨号链接',
      '邮箱',
      '地址',
      '营业时间',
      'ICP 备案号',
      '公安备案号',
    ];
    for (const l of expectedLabels) {
      expect(screen.getByText(l)).toBeInTheDocument();
    }
    // 断言至少 10 个字段标签
    expect(expectedLabels.length).toBeGreaterThanOrEqual(10);
  });

  it('U2: 含「待补充」字段 → amber 提示出现', () => {
    // brand.phone = "联系方式待补充" (含 "待补充")
    // brand.address = "广东省佛山市顺德区大良（详细地址待补充）" (含 "待补充")
    // brand.icp / brand.police = "ICP备案号待备案" / "公安备案号待备案" (含 "待备案")
    // brand.businessHours = "营业时间待确认" (含 "待确认")
    // brand.email = "lanhui@example.com" (含 "example")
    render(<BrandTab />);

    const placeholders = screen.getAllByText('该字段需运营人员填写');
    // phone / address / icp / police / businessHours / email 都触发
    expect(placeholders.length).toBeGreaterThanOrEqual(5);

    // amber 类名: text-amber-400
    for (const p of placeholders) {
      expect(p.className).toContain('text-amber-400');
    }
  });

  it('U3: mount → 「Demo 阶段只读」徽章出现', () => {
    render(<BrandTab />);
    expect(screen.getByText('Demo 阶段只读')).toBeInTheDocument();
  });
});
