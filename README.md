# flair-docs

FLAIR's documentation site — architecture, deployment, CI/CD, backlog process, and more, for
the [FLAIR](https://github.com/flair-security) open source security observability project.
Built with [Docusaurus](https://docusaurus.io/) and published as a static site.

## Running locally

```bash
npm ci
npm start
```

This starts a local dev server (with hot reload) at `http://localhost:3000/flair-docs/`.

Other useful commands:

```bash
npm run build      # production build, output in build/
npm run serve       # serve a production build locally
npm run typecheck   # type-check the config files
npm run lint:md     # lint markdown content
```

## Organization

Content lives under [`docs/`](docs/), split into eight independent sections — each is its own
Docusaurus docs plugin instance with its own route and auto-generated sidebar, not one merged
tree:

| Section | Route | Description |
| --- | --- | --- |
| [`docs/setup/`](docs/setup/) | `/setup` | Local dev environment setup |
| [`docs/architecture/`](docs/architecture/) | `/architecture` | System design (versioned per release) |
| [`docs/adr/`](docs/adr/) | `/adr` | Architecture Decision Records (versioned per release) |
| [`docs/cicd/`](docs/cicd/) | `/cicd` | CI/CD pipeline documentation |
| [`docs/audits/`](docs/audits/) | `/audits` | Pointers to the org's per-domain security/quality audits |
| [`docs/backlog/`](docs/backlog/) | `/backlog` | GitHub Projects backlog process |
| [`docs/workflow/`](docs/workflow/) | `/workflow` | The org's agentic development workflow |
| [`docs/specs/`](docs/specs/) | `/specs` | Reserved for frozen per-User-Story specs (not yet adopted) |

`architecture` and `adr` are versioned via `npx docusaurus docs:version:<id> <version>` and get
frozen at each product release; the other sections track the current state of the org/product
continuously.

## License

Documentation in this repo is licensed under **CC BY 4.0** — see [LICENSE](LICENSE).

## Contributing

See the org-wide
[`CONTRIBUTING.md`](https://github.com/flair-security/.github/blob/main/CONTRIBUTING.md).
