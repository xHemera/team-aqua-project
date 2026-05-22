export type SpellDescriptionSegment = {
  text: string;
  highlight?: boolean;
};

export type SpellTokenResolver = (args: {
  token: string;
  tokenIndex: number;
  fullMatch: string;
  percentSuffix: string;
}) => string | number | null;

const TOKEN_PATTERN = /\{([^}]+)\}(%)?/g;

const formatTokenValue = (value: string | number) => String(value);

export const resolveSpellDescriptionSegments = (
  description: string,
  resolveToken: SpellTokenResolver,
): SpellDescriptionSegment[] => {
  const segments: SpellDescriptionSegment[] = [];
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of description.matchAll(TOKEN_PATTERN)) {
    const fullMatch = match[0];
    const token = match[1];
    const percentSuffix = match[2] ?? "";
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      segments.push({ text: description.slice(lastIndex, startIndex) });
    }

    const resolved = resolveToken({
      token,
      tokenIndex,
      fullMatch,
      percentSuffix,
    });

    if (resolved !== null) {
      segments.push({
        text: `${formatTokenValue(resolved)}${percentSuffix}`,
        highlight: true,
      });
    } else {
      segments.push({
        text: fullMatch,
        highlight: true,
      });
    }

    lastIndex = startIndex + fullMatch.length;
    tokenIndex += 1;
  }

  if (lastIndex < description.length) {
    segments.push({ text: description.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text: description }];
};
