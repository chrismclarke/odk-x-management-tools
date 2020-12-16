# Deploy Standalone

When deploying standalone, both the dashboard and api apps need to be deployed together so that requests to the odk rest api can be proxied (by default they will be blocked by CORS policies if the dashboard is on a different domain to the odk sync server)

The easiest way to do this is using [Vercel](https://vercel.com/), which is a service that offers hosting of web and node apps. The demo at https://odkx-tools.c2dev.co.uk/ is freely hosted with Vercel.

The repo is already configured to work with Vercel, so once forked can be connected to vercel for automatic deployment from the master branch.

Alternatively [github actions](/.github/workflows/deploy-vercel-production.yml) also exist to deploy staging (master branch) and production (releases) builds. To use these you will need to configure github secrets as outlined in https://github.com/amondnet/vercel-action

