# Releasing

## Automated moc updates

When a new Motoko version is released at [caffeinelabs/motoko](https://github.com/caffeinelabs/motoko),
the [`update-moc`](.github/workflows/update-moc.yml) workflow is triggered via `repository_dispatch`.
It automatically:

1. Downloads the new `moc.js` / `moc_interpreter.js` and core library
2. Updates error code explanations
3. Bumps the npm version (minor)
4. Runs tests
5. Opens a PR titled "Update moc to \<version\>"

Review and merge the PR when ready.

### Manual trigger

You can also trigger the workflow manually from the Actions tab (`workflow_dispatch`),
with optional `moc_version` and `core_version` inputs. Leave them empty to auto-detect the latest.

## Publishing to npm

After merging a moc update (or any version bump), create a **GitHub Release**:

1. Go to [Releases](https://github.com/caffeinelabs/node-motoko/releases/new)
2. Create a new tag matching the `package.json` version (e.g. `v4.1.0`)
3. Click "Publish release"

The [`release`](.github/workflows/release.yml) workflow will automatically:
- Validate the tag matches `package.json`
- Build and test
- Publish to npm via [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) (no tokens needed)

## Setup (one-time)

### npm trusted publishing

1. Ensure 2FA is enabled on the npm account that owns the `motoko` package
2. Go to https://www.npmjs.com/package/motoko/access
3. In the **Trusted Publisher** section, select **GitHub Actions** and fill in:
   - **Repository owner:** `caffeinelabs`
   - **Repository name:** `node-motoko`
   - **Workflow filename:** `release.yml`
   - **Environment:** `npm`
4. Save
5. In GitHub repo settings (Settings > Environments), create an environment named `npm`

### GitHub App token

The `update-moc` workflow uses a GitHub App token (via `GENERIC_CI_RW_APP_ID` / `GENERIC_CI_RW_APP_PRIVATE_KEY`)
so that auto-created PRs trigger CI checks. PRs created with the default `GITHUB_TOKEN`
[do not trigger other workflows](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow).

Ensure the GitHub App is installed on `caffeinelabs/node-motoko` with `contents: write`
and `pull_requests: write` permissions, and that the app ID / private key are available as
`vars.GENERIC_CI_RW_APP_ID` and `secrets.GENERIC_CI_RW_APP_PRIVATE_KEY`.

### repository_dispatch from motoko repo

Add a step at the end of the `publish` job in
[caffeinelabs/motoko/.github/workflows/release.yml](https://github.com/caffeinelabs/motoko/blob/master/.github/workflows/release.yml):

```yaml
- name: Notify node-motoko of new release
  if: ${{ github.event_name == 'push' }}
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ steps.app-token.outputs.token }}
    repository: caffeinelabs/node-motoko
    event-type: motoko-release
    client-payload: '{"version": ${{ toJSON(github.ref_name) }}}'
```

The GitHub App (`GENERIC_CI_RW_APP_ID`) must also have write access to `caffeinelabs/node-motoko`
for cross-repo dispatch to work.

## Local development (generate)

To regenerate files locally against a specific version:

```bash
npm ci
npm run build
npm run generate  # prints latest versions and suggested command
npm run generate <moc_version> <core_version>
```

Set `MOTOKO_REPO` to point to a local motoko checkout (used for error codes).
Defaults to `../../motoko/`.
