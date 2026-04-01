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

After merging a moc update (or any version bump), bump the **`version`** field in `package.json` and merge to `main`.

The [`release`](.github/workflows/release.yml) workflow runs when `package.json` changes on `main`. If the **version** field changed compared to the previous commit on `main`, it will:

- Build and test
- Publish to npm via [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) (no tokens needed)
- Notify [vscode-motoko](https://github.com/caffeinelabs/vscode-motoko) to open a PR bumping the `motoko` dependency (GitHub App must include the `vscode-motoko` repo; same app as `update-moc`)

Updating the version in `package.json` automatically publishes the package when merged into `main`.

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
