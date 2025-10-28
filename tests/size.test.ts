import { describe, it, expect } from 'vitest';
import { Size } from '../src/util';

describe('Size', () => {
  it.each([
    ['1024 MiB', '1 GiB'],
    ['10 MiB', '10 MiB'],
    ['2048 KiB', '2 MiB'],
  ])('equal %s == %s', (a, b) => {
    const s1 = new Size(a);
    const s2 = new Size(b);
    expect(s1.eq(s2)).toBe(true);
  });

  it.each([
    ['1023 MiB', '1 GiB'],
    ['10 MiB', '11 MiB'],
    ['2049 KiB', '2 MiB'],
  ])('not equal %s != %s', (a, b) => {
    const s1 = new Size(a);
    const s2 = new Size(b);
    expect(s1.eq(s2)).toBe(false);
  });

  it.each([
    ['1025 MiB', '1 GiB'],
    ['11 MiB', '10 MiB'],
    ['2049 KiB', '2 MiB'],
  ])('greater than %s > %s', (a, b) => {
    const s1 = new Size(a);
    const s2 = new Size(b);
    expect(s1.gt(s2)).toBe(true);
  });

  it.each([
    ['1025 MiB', '1 GiB'],
    ['10 MiB', '10 MiB'],
    ['2049 KiB', '2 MiB'],
    ['2048 KiB', '2 MiB'],
  ])('greater equal %s >= %s', (a, b) => {
    const s1 = new Size(a);
    const s2 = new Size(b);
    expect(s1.gte(s2)).toBe(true);
  });

  it.each([
    ['1024 MiB', '1 GiB', '2.00 GiB'],
    ['10 MiB', '11 MiB', '21.00 MiB'],
    ['2048 KiB', '2 MiB', '4.00 MiB'],
  ])('add %s + %s = %s', (a, b, out) => {
    let s = new Size(a).add(new Size(b));
    expect(String(s)).toBe(out);
    s = new Size(a).plusEq(new Size(b));
    expect(String(s)).toBe(out);
  });
});
