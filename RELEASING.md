# Updating `moc`

Setup:

```bash
git switch main && git pull
npm ci
npm run build
```

Run the generate script with no arguments to check the latest versions:

```bash
npm run generate
```

Verify the target versions, and then pass additional CLI args to generate the files:

```bash
export MOC_VERSION=...
export CORE_VERSION=...
npm run generate $MOC_VERSION $CORE_VERSION
```

Bump version:

```bash
npm version minor --no-git-tag-version
```

Or `patch` / `major` as appropriate.
The `--no-git-tag-version` flag prevents npm from auto-committing and tagging — we do that manually below.

Setup PR branch:

```bash
git switch -c $USER/$MOC_VERSION
git add -A
```

Verify staged files look right and then commit, push, and open a PR:

```bash
git commit -m "Update moc to $MOC_VERSION"
git push --set-upstream origin $USER/$MOC_VERSION
gh pr create --title "Update moc to $MOC_VERSION" --body ""
gh pr view --web
```

View, review, and merge the PR.

## Publish (after PR is merged)

```bash
git switch main && git pull
npm publish
```
