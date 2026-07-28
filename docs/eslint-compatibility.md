# ESLint and Next.js compatibility report

## Root cause

The repository uses ESLint's flat configuration file, but it imported the CommonJS,
legacy-format export from `eslint-config-next` directly. Loading that export immediately
loads `@rushstack/eslint-patch/modern-module-resolution`. Because the legacy config was
being evaluated through an unrecognized flat-config ESM call path, Rushstack could not
find ESLint's expected caller and stopped during initialization.

`@rushstack/eslint-patch` was never a direct dependency or direct repository import. The
dependency chain is:

```text
eslint.config.mjs
  -> @eslint/eslintrc FlatCompat
  -> eslint-config-next@15.3.6
  -> @rushstack/eslint-patch@1.16.1
  -> @rushstack/eslint-patch/modern-module-resolution
```

The supported Next 15 flat-config bridge is `FlatCompat`, extending
`next/core-web-vitals` and `next/typescript`. This preserves the Next.js, React,
accessibility, and TypeScript rules while loading the legacy shareable config through
the call path for which it was designed.

## Locked compatibility matrix

| Package | Installed | Supported range used for validation |
| --- | ---: | --- |
| Next.js | 15.3.6 | Matched exactly by `eslint-config-next` |
| React / React DOM | 19.0.0 | Next peer: `^18.2.0` or supported React 19 ranges |
| ESLint | 9.39.5 | `eslint-config-next` peer: `^7.23.0 || ^8.0.0 || ^9.0.0` |
| eslint-config-next | 15.3.6 | Must match Next.js 15.3.6 |
| @rushstack/eslint-patch | 1.16.1 | Transitive dependency selected by `eslint-config-next` range `^1.10.3` |
| TypeScript | 5.9.3 | `eslint-config-next` peer: `>=3.3.1` |

The authoritative compatibility ranges above come from the packages' published peer
and dependency metadata captured in `package-lock.json`. The CI compatibility check
evaluates those ranges, requires matching Next/config versions, requires exactly one
locked ESLint installation, rejects direct Rushstack imports, and rejects the invalid
direct import of the legacy `eslint-config-next` export.
