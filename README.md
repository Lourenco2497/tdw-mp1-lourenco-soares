# A statically generated blog example using Next.js and Contentful

This example showcases Next.js's [Static Generation](https://nextjs.org/docs/basic-features/pages) feature using [Contentful](https://www.contentful.com/) as the data source.

## How to use

Use the existing application in the repository root (the directory containing this README and `package.json`). Do not scaffold another app inside it.

After completing the Contentful configuration below, run these commands from the repository root:

```bash
npm ci
npm run dev
```

## Configuration

### Step 1. Create an account and a space on Contentful

First, [create an account on Contentful](https://www.contentful.com/sign-up/).

After creating an account, create a new empty **space** from the [dashboard](https://app.contentful.com/) and assign to it any name of your liking.

### Step 2. Set up environment variables

All scripts and the app read their configuration from a `.env.local` file in the project root, which is ignored by Git. Copy the example file:

```bash
cp .env.local.example .env.local
```

Then fill in each variable:

- `CONTENTFUL_SPACE_ID`: in your Contentful dashboard go to **Settings > General Settings** and copy the **Space ID**.
- `CONTENTFUL_ACCESS_TOKEN`: go to **Settings > API keys**. Use the **[Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/) - access token** of the example key, or create a new key.
- `CONTENTFUL_PREVIEW_ACCESS_TOKEN`: from the same API key, use the **[Content Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/) - access token**.
- `CONTENTFUL_MANAGEMENT_TOKEN`: go to **Settings > CMA tokens** and click **Create personal access token**, then in the table row click **Authorize Access** and **Authorize**. It starts with `CFPAT-` and has the same access rights as your user. **Do not share it publicly.** It is only used by the setup script in the next step, and you can delete it afterwards.

Your `.env.local` file should look like this:

```bash
CONTENTFUL_SPACE_ID=...
CONTENTFUL_ACCESS_TOKEN=...
CONTENTFUL_PREVIEW_ACCESS_TOKEN=...
CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-...
```

### Step 3. Create a content model

The [content model](https://www.contentful.com/developers/docs/concepts/data-model/) defines the data structures of your application/websites. The structures are flexible and you can tailor them to your needs.

For this example you need to create a content model that defines an author and a post content type. **You can create these two by running a script or by doing it manually** to familiarize yourself with the Contentful user interface.

#### Run a script to create the content model

This project includes a setup script which you can use to set up the content model expected by the source code. It reads `CONTENTFUL_SPACE_ID` and `CONTENTFUL_MANAGEMENT_TOKEN` from the `.env.local` file you created in Step 2.

```bash
npm install
npm run setup
```

If you prefer not to store the management token in a file, you can pass both values inline instead:

```bash
CONTENTFUL_SPACE_ID=YOUR_SPACE_ID CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-XXX npm run setup
```

This command will create the needed content structures and set up your Contentful space ready to use. The output should look as follows:

```
> setup
> node --env-file-if-exists=.env.local ./lib/setup.js

┌──────────────────────────────────────────────────┐
│ The following entities are going to be imported: │
├─────────────────────────────────┬────────────────┤
│ Content Types                   │ 2              │
├─────────────────────────────────┼────────────────┤
│ Editor Interfaces               │ 2              │
├─────────────────────────────────┼────────────────┤
│ Locales                         │ 1              │
├─────────────────────────────────┼────────────────┤
│ Webhooks                        │ 0              │
├─────────────────────────────────┼────────────────┤
│ Entries                         │ 0              │
├─────────────────────────────────┼────────────────┤
│ Assets                          │ 0              │
└─────────────────────────────────┴────────────────┘
 ✔ Validating content-file
 ✔ Initialize client (1s)
 ✔ Checking if destination space already has any content and retrieving it (2s)
 ✔ Apply transformations to source data (1s)
 ✔ Push content to destination space
   ✔ Connecting to space (1s)
   ...
   ...
   ...
```

#### Create the content model manually

##### Create an `Author` content type

From your contentful space, go to **Content model** and add a new content type:

- Give it the **Name** `Author`, the **Api Identifier** should be `author`

Once the content model is saved, add these fields (you don't have to modify the settings unless specified):

- `name` - **Text** field (type **short text**). **Field ID** should be set to `name`
- `picture` - **Media** field (type **one file**). **Field ID** should be set to `picture`

Save the content type and continue.

##### Create a `post` type

From your contentful space, go to **Content model** and add another content type:

- Give it the **Name** `Post`, the **Api Identifier** should be `post`

Next, add these fields (you don't have to modify the settings unless specified):

- `title` - **Text** field (type **short text**)
- `content` - **Rich text** field
- `excerpt` - **Text** field (type **Long text, full-text search**)
- `coverImage` - **Media** field (type **one file**)
- `date` - **Date and time** field
- `slug` - **Text** field. You can optionally go to the settings of this field, and under **Appearance**, select **Slug** to display it as a slug of the `title` field.
- `author` - **Reference** field (type **one reference**)

Save the content type and continue.

### Step 4. Validate your content model

In your Contentful space, go to **Content model** to see the result. It should look as follows.

**Content model overview**

![Content model overview](https://github.com/vercel/next.js/assets/9113740/d3f76907-7046-4d94-b285-eb89b87aa223)

### Step 5. Populate Content

The app only shows content that is **published**. Entries and images you save but do not publish stay in draft and will not appear on the site.

Go to the **Content** section in your space, then click on **Add entry** and select the **Author** content type:

- You just need **1 author entry**.
- Use dummy data for the text.
- For the image, you can download one from [Unsplash](https://unsplash.com/).
- **Publish the picture asset**, then **Publish the author entry**.

Next, create another entry with the content type **Post**:

- We recommend creating at least **2 post entries**.
- Use dummy data for the text.
- For images, you can download them from [Unsplash](https://unsplash.com/).
- Pick the **author** you created earlier.
- Fill in every field, including **date**, **slug** and **cover image**. They are all required.
- **Publish the cover image asset**, then **Publish the post entry**.

**Important:** publishing an entry does not publish the images it links to. Each asset must be published on its own, otherwise the post will show up without an image or not at all. You can check the status of everything in the **Content** and **Media** sections: it should say **Published**, not **Draft** or **Changed**.

![Published content entry](https://github.com/vercel/next.js/assets/9113740/e1b4a3fe-45f4-4851-91db-8908d3ca18e9)

### Step 6. Run Next.js in development mode

Next.js reads `.env.local` automatically.

```bash
npm install
npm run dev
```

Your blog should be up and running on [http://localhost:3000](http://localhost:3000)! If it doesn't work, post on [GitHub discussions](https://github.com/vercel/next.js/discussions).

## Production build and checks

Run all commands from the repository root. The published-content build needs only `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`; it does not need the management or preview token.

```bash
npm run build
npm run check
```

Use Node.js 24, as recorded in `.nvmrc`, and install dependencies with `npm ci`. The Vitest tests mock Contentful, so they need no credentials. The build exports the home page, published post pages, and a 404 page into `out/`. Deploy that directory to a static host such as Cloudflare Pages. There is no `npm start` server for this static export; use `npm run dev` for local development.

Publishing or unpublishing Contentful content requires another build and deployment. The Contentful webhook triggers GitHub Actions through `repository_dispatch` with event type `contentful-update`. Missing credentials, failed CMS queries, or incomplete published posts fail the build rather than silently deploying an empty blog. A genuinely empty CMS collection still displays the empty state.

### Production and PR previews

Production deployments run only from `main`. GitHub Actions publishes to [the main site](https://tdw-mp1-lourenco-soares.pages.dev/), while CircleCI publishes to [its separate demonstration site](https://tdw-mp1-lourenco-soares-circleci.pages.dev/).

For pull requests originating in this repository, GitHub Actions also deploys an isolated Cloudflare Pages preview after its quality checks and static build succeed. The preview reuses the build artifact, targets a `pr-<number>` branch, and adds or updates one bot comment on the PR with its URL. Later successful builds update that comment. Fork PRs do not receive previews. CircleCI continues to deploy only from `main`.

Previews are public review environments and do not replace either production site. This implementation interprets the assignment's default-branch deployment restriction as applying to production, with previews as an additional review feature. If the restriction is intended to cover every deployment, disable the `preview` job. The GitHub preview waits for GitHub's own quality/build chain; the six required checks across both platforms still govern merging into `main`.

### Local quality commands

| Command                | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run lint`         | Check Next.js and TypeScript lint rules; warnings fail the check               |
| `npm run format:check` | Check Prettier formatting without changing files                               |
| `npm run format`       | Apply Prettier formatting                                                      |
| `npm test`             | Run the eight CMS regression tests once with Vitest                            |
| `npm run test:watch`   | Re-run tests while editing                                                     |
| `npm run typecheck`    | Check TypeScript without emitting application files                            |
| `npm run check`        | Run lint, formatting check, tests, and type checking in order; stop on failure |

Use the same check commands in the future CI pipelines. Generated build files are excluded; Git enforces LF text line endings so Windows and Linux checkouts agree. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`; no policy change is needed.

## Acknowledgements

This project is based on the original work by **Francisco Regalado**:
[https://github.com/TDW-2025/MP1](https://github.com/TDW-2025/MP1)
