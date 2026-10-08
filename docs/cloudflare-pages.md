# Cloudflare Pages deployment

Cloudflare Pages builds the `main` branch of [YouthOpps/youthopps.github.io](https://github.com/YouthOpps/youthopps.github.io) when a website commit is pushed.

Configure the Pages project to use Node.js 22, build command `npm run build`, output directory `dist`, and production branch `main`. The website uses a public Git submodule at `data-source/` pointing to [YouthOpps/data-source](https://github.com/YouthOpps/data-source). Ensure the Pages checkout initializes Git submodules. The build reads `data-source/catalog.json` directly and fails if the required catalog is missing.

The `check new data` workflow in the website repository runs hourly (UTC), fetches `data-source/main`, and only commits/pushes an updated submodule pointer if the source commit changed. The website Git integration then triggers deployment; no Deploy Hook, webhook, catalog release pointer, or cross-repository write permission is required.

A pipeline source workflow writes only to `data-source`, not to the website repository. The update is not instantaneous: GitHub scheduled workflows may run late. For urgent updates, manually dispatch `check new data`.

Confirm deployment using the Cloudflare Pages dashboard and verify the production content at https://youthopps.org. A GitHub commit alone does not establish deployment success.
