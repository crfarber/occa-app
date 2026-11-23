import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  axisOf,
  fitsGrid,
  HEIGHT_PROPERTIES,
  isHeightStep,
  isUniformStep,
  isWidthStep,
  WIDTH_PROPERTIES,
} from './size-grid';
import { size, spacingX, spacingY, text } from './theme';

describe('size grid rules', () => {
  it('accepts widths in steps of 5', () => {
    expect([5, 10, 15, 20, 25, 260, -20].every(isWidthStep)).toBe(true);
    expect([4, 8, 12, 28, 2.5].some(isWidthStep)).toBe(false);
  });

  it('accepts heights of 2 or in steps of 4', () => {
    expect([2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 96, -2].every(isHeightStep)).toBe(true);
    expect([1, 3, 6, 10, 26, 34, 98].some(isHeightStep)).toBe(false);
  });

  it('only accepts a uniform padding, margin or gap that fits both grids', () => {
    expect(isUniformStep(20)).toBe(true);
    expect(isUniformStep(40)).toBe(true);
    expect(isUniformStep(12)).toBe(false);
    expect(isUniformStep(15)).toBe(false);
  });

  it('classifies style properties by axis', () => {
    expect(axisOf('paddingHorizontal')).toBe('width');
    expect(axisOf('lineHeight')).toBe('height');
    expect(axisOf('gap')).toBe('uniform');
    expect(axisOf('borderWidth')).toBeNull();
  });

  it('checks a value against the axis of its property', () => {
    expect(fitsGrid('width', 15)).toBe(true);
    expect(fitsGrid('width', 12)).toBe(false);
    expect(fitsGrid('minHeight', 44)).toBe(true);
    expect(fitsGrid('minHeight', 66)).toBe(false);
    expect(fitsGrid('padding', 12)).toBe(false);
    expect(fitsGrid('padding', 0)).toBe(true);
    expect(fitsGrid('borderWidth', 3)).toBe(true);
  });
});

describe('theme tokens', () => {
  it('keeps every horizontal step on the width grid', () => {
    const off = Object.entries(spacingX).filter(([, value]) => !isWidthStep(value));
    expect(off).toEqual([]);
  });

  it('keeps every vertical step on the height grid', () => {
    const off = Object.entries(spacingY).filter(([, value]) => !isHeightStep(value));
    expect(off).toEqual([]);
  });

  it('keeps every line height on the height grid', () => {
    const off = Object.entries(text).filter(([, style]) => !isHeightStep(style.lineHeight));
    expect(off).toEqual([]);
  });

  it('keeps sizes on the height grid, and widths also on the width grid', () => {
    const off = Object.entries(size).filter(
      ([name, value]) => !isHeightStep(value) || (name.endsWith('Width') && !isWidthStep(value)),
    );
    expect(off).toEqual([]);
  });
});

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const full = join(directory, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const STYLE_FILES = walk(SRC)
  .filter((path) => /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path))
  .map((path) => ({ rel: relative(SRC, path).split(sep).join('/'), path }))
  .filter(({ rel }) => rel !== 'shared/ui/remi-tokens.ts' && rel !== 'shared/ui/size-grid.ts');

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** Lines of every style file, with `{ width, height }` offsets (shadows) left out. */
function styleLines(): { where: string; line: string }[] {
  return STYLE_FILES.flatMap(({ rel, path }) =>
    stripComments(readFileSync(path, 'utf8'))
      .split('\n')
      .map((line, index) => ({ where: `${rel}:${index + 1}`, line }))
      .filter(({ line }) => !/Offset\s*:/.test(line)),
  );
}

const ALL_PROPERTIES = [...WIDTH_PROPERTIES, ...HEIGHT_PROPERTIES, 'padding', 'margin', 'gap'];
const NUMBER_LITERAL = new RegExp(
  `\\b(${ALL_PROPERTIES.join('|')})\\s*:\\s*(-?\\d+(?:\\.\\d+)?)(?![\\w.%'"])`,
  'g',
);

describe('styles in src', () => {
  it('scans the style files and recognises an off-grid literal', () => {
    expect(STYLE_FILES.length).toBeGreaterThan(30);
    const sample = "  box: { width: 72, minHeight: 48, padding: 12, height: '50%', top: 0.5 },";
    expect([...sample.matchAll(NUMBER_LITERAL)].map(([match]) => match)).toEqual([
      'width: 72',
      'minHeight: 48',
      'padding: 12',
      'top: 0.5',
    ]);
  });

  it('only use literal sizes that fit the grid of their axis', () => {
    const off = styleLines().flatMap(({ where, line }) =>
      [...line.matchAll(NUMBER_LITERAL)]
        .filter(([, property, value]) => property && !fitsGrid(property, Number(value)))
        .map(([match]) => `${where} ${match}`),
    );
    expect(off).toEqual([]);
  });

  it('use spacingX for widths and spacingY for heights', () => {
    const wrongAxis = new RegExp(
      `\\b(?:(?:${WIDTH_PROPERTIES.join('|')})\\s*:\\s*-?spacingY|(?:${HEIGHT_PROPERTIES.join('|')})\\s*:\\s*-?spacingX)\\.`,
    );
    const off = styleLines()
      .filter(({ line }) => wrongAxis.test(line))
      .map(({ where, line }) => `${where} ${line.trim()}`);
    expect(off).toEqual([]);
  });

  it('split a uniform padding or margin token into a horizontal and vertical value', () => {
    const off = styleLines()
      .filter(({ line }) => /\b(?:padding|margin)\s*:\s*-?spacing[XY]\./.test(line))
      .map(({ where, line }) => `${where} ${line.trim()}`);
    expect(off).toEqual([]);
  });
});
