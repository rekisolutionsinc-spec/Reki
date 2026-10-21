function encodePath(path: string) {
  return path
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}

export function legacyImageUrl(source: string) {
  const cleanSource = unescapeCssPath(source.split(/[?#]/, 1)[0]).replaceAll("\\", "/");
  const match = cleanSource.match(/(?:^|\/)img\/(.+)$/i);
  if (!match) return null;
  return `/img/${encodePath(match[1])}`;
}

function unescapeCssPath(value: string) {
  return value.replace(/\\([0-9a-f]{1,6})(?:\s)?|\\(.)/gi, (_match, hex: string | undefined, escaped: string | undefined) => {
    if (hex) {
      const codePoint = Number.parseInt(hex, 16);
      return codePoint === 0 || codePoint > 0x10ffff ? "\uFFFD" : String.fromCodePoint(codePoint);
    }
    return escaped ?? "";
  });
}

export function rewriteLegacyCssImages(css: string) {
  return css.replace(/url\(\s*(?:(["'])(.*?)\1|([^)]*?))\s*\)/gi, (match, _quote: string | undefined, quoted: string | undefined, unquoted: string | undefined) => {
    const source = unescapeCssPath((quoted ?? unquoted ?? "").trim());
    if (/^(?:data:|https?:|\/\/|#)/i.test(source)) return match;

    const suffixIndex = source.search(/[?#]/);
    const pathname = suffixIndex < 0 ? source : source.slice(0, suffixIndex);
    const suffix = suffixIndex < 0 ? "" : source.slice(suffixIndex);
    const localPath = pathname.match(/^(?:(?:\.\.\/|\.\/)+)?(?:\/?legacy-assets\/)?\/?img\/(.+)$/i)?.[1];
    if (!localPath) return match;

    return `url("/img/${encodePath(localPath)}${suffix}")`;
  });
}
