# Netlify Deployment

## Build settings

Configure the Netlify project with these values:

| Setting | Value |
| --- | --- |
| Runtime | Next.js |
| Base directory | `/` |
| Package directory | Not set |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Functions directory | `netlify/functions` |
| Deploy log visibility | Logs are public |

The project does not use `output: 'export'`, so it should be deployed as a regular Next.js application rather than as a static export.

## Environment variables

The Supabase client is loaded while Next.js prerenders `/`. Both variables must exist in Netlify before `npm run build` starts. Otherwise the build fails with:

```text
Error: Missing NEXT_PUBLIC_SUPABASE_URL
```

In Netlify, open **Project configuration -> Environment variables -> Add a variable** and create these exact variable names:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Set the values from the local `.env.local` file, without surrounding quotes. Make them available to **Production** deploys and **Deploy previews** if previews are used. The publishable/anonymous key is intended for browser use; never add a Supabase secret or service-role key to a `NEXT_PUBLIC_` variable.

Do not commit `.env.local` or place its values in this documentation file.

## Fix for missing-variable build errors

1. Add `NEXT_PUBLIC_SUPABASE_URL` with the Supabase project URL.
2. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the Supabase publishable key.
3. Confirm both variables are enabled for the deploy context that is failing.
4. Open **Deploys**, select the failed deploy, and choose **Retry deploy**.
5. If the old environment is still being used, choose **Retry without cache**.
6. Confirm the new log gets past `Generating static pages` and completes `npm run build`.

Changing `.env.local` on a development machine does not update Netlify. Netlify has its own environment-variable store, and a new deploy is required after changing those values.

## Git deployment

1. Push the project to the connected Git repository.
2. In Netlify, open the `attendencetiu` project.
3. Confirm the build settings above.
4. Add the two environment variables before the first deploy.
5. Trigger **Deploy site** or push a new commit.
6. Review the deploy log and open the generated site URL.

Netlify will automatically start a new build whenever a new commit is pushed to the configured production branch.

## Local verification

Run the production build before pushing:

```bash
npm install
npm run build
```

The application requires Supabase configuration at runtime. If authentication or data access fails after deployment, verify the Netlify environment variables and the Supabase authentication/site URL configuration.
