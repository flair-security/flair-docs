# Missing assets

`docusaurus.config.js` references two image files that are **not** included in this scaffold:

- `img/logo.svg` — navbar logo
- `img/favicon.svg` — browser favicon

No placeholder binary/SVG has been fabricated for either. These need to be supplied by the
FLAIR founder (or derived from the real logo assets already used in
`flair-security/.github/resources/images/`) before running `npm run build` — the build will
fail on the missing files until then.
