#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REMOTE="$(git remote get-url origin)"
NAME="$(git config --local user.name)"
EMAIL="$(git config --local user.email)"
TMP="$ROOT/.deploy-tmp"

if [[ -z "$REMOTE" ]]; then
  echo "No git origin configured." >&2
  exit 1
fi

npm run build
touch dist/.nojekyll

rm -rf "$TMP"
mkdir -p "$TMP"
cp -R dist/. "$TMP/"

cd "$TMP"
git init -q -b gh-pages
git config user.name "$NAME"
git config user.email "$EMAIL"
git add -A
git commit -m "deploy: publish GitHub Pages"
git remote add origin "$REMOTE"
git push --force origin gh-pages

cd "$ROOT"
rm -rf "$TMP"
echo "Published gh-pages from $REMOTE"
