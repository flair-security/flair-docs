// @ts-check
const fs = require('fs');
const path = require('path');
const { themes: prismThemes } = require('prism-react-renderer');

const organizationName = 'flair-security';
const projectName = 'flair-docs';

// Docusaurus creates <id>_versions.json the first time `docs:version:<id>` runs.
// Until that file exists there is only one version ("Next") — showing a version
// dropdown would be pointless (nothing to pick besides "Next"). Only enable it
// once a version has actually been cut.
function hasCutVersions(id) {
  return fs.existsSync(path.join(__dirname, `${id}_versions.json`));
}

/**
 * One docs plugin instance per top-level docs folder, each with its own
 * auto-generated sidebar and route.
 *
 * `versioned: true` on architecture/adr: these sections are frozen at each
 * product release (flair-core/flair-agent tag) via `npx docusaurus docs:version:<id> <version>`.
 * The other sections (setup, cicd, audits, backlog, workflow, specs) track the
 * current state of the org/product continuously — versioning their content
 * wouldn't make sense.
 */
const sections = [
  { id: 'setup', label: 'Setup', path: 'docs/setup' },
  { id: 'architecture', label: 'Architecture', path: 'docs/architecture', versioned: true },
  { id: 'adr', label: 'ADR', path: 'docs/adr', versioned: true },
  { id: 'cicd', label: 'CI/CD', path: 'docs/cicd' },
  { id: 'audits', label: 'Audits', path: 'docs/audits' },
  { id: 'backlog', label: 'Backlog', path: 'docs/backlog' },
  { id: 'workflow', label: 'Workflow', path: 'docs/workflow' },
  { id: 'specs', label: 'Specs', path: 'docs/specs' },
];

const editUrl = `https://github.com/${organizationName}/${projectName}/edit/main/`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'FLAIR Docs',
  tagline: 'Flow and Link Analysis with Inspection Report — see every flow, expose every risk',
  favicon: 'img/favicon.svg',

  // "Classic" markdown parser (not strict MDX): docs across the org tend to
  // include raw HTML (e.g. <picture>/<img> blocks, badge tables) that would
  // break MDX's JSX-flavored parsing.
  markdown: {
    format: 'md',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  url: `https://${organizationName}.github.io`,
  baseUrl: `/${projectName}/`,

  organizationName,
  projectName,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: sections.map((section) => [
    '@docusaurus/plugin-content-docs',
    /** @type {import('@docusaurus/plugin-content-docs').Options} */
    ({
      id: section.id,
      path: section.path,
      routeBasePath: section.id,
      sidebarPath: require.resolve('./sidebars.js'),
      editUrl,
      editCurrentVersion: true,
    }),
  ]),

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'FLAIR Docs',
        logo: {
          alt: 'FLAIR',
          src: 'img/logo.svg',
        },
        items: [
          ...sections.flatMap((section) => [
            {
              to: `/${section.id}`,
              label: section.label,
              position: 'left',
            },
            ...(section.versioned && hasCutVersions(section.id)
              ? [
                  {
                    type: 'docsVersionDropdown',
                    docsPluginId: section.id,
                    position: 'left',
                  },
                ]
              : []),
          ]),
          {
            href: `https://github.com/${organizationName}/${projectName}`,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Repos',
            items: [
              { label: 'flair-agent', href: 'https://github.com/flair-security/flair-agent' },
              { label: 'flair-core', href: 'https://github.com/flair-security/flair-core' },
              { label: 'flair-ui', href: 'https://github.com/flair-security/flair-ui' },
            ],
          },
          {
            title: 'Documentation',
            items: sections.map((section) => ({
              label: section.label,
              to: `/${section.id}`,
            })),
          },
        ],
        // No license identifier is asserted here — see LICENSE at the repo root
        // for the authoritative terms.
        copyright: `Copyright © ${new Date().getFullYear()} FLAIR`,
      },
      metadata: [
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: `https://${organizationName}.github.io/${projectName}/img/logo.svg` },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:image', content: `https://${organizationName}.github.io/${projectName}/img/logo.svg` },
      ],
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

module.exports = config;
