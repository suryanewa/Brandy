export function syncDesignTokens(options?: { check?: boolean }): Promise<void>;

export function syncDesignTokensFromValues(
  values: Record<string, unknown>,
  options?: { check?: boolean },
): Promise<{ changedCount: number }>;

export function syncLandingCopy(options?: { check?: boolean }): Promise<void>;
