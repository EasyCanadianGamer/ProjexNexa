#!/usr/bin/env bash
# Usage: ./scripts/update-latest-json.sh v0.1.7
# Run this AFTER GitHub Actions has uploaded release artifacts.
# Requires: gh CLI (https://cli.github.com), python3

set -e

TAG=${1:?"Usage: $0 <tag> (e.g. v0.1.7)"}
REPO="EasyCanadianGamer/ProjexNexa"
VERSION="${TAG#v}"

echo "Fetching signatures for $TAG from $REPO..."

LINUX_SIG=$(gh release download "$TAG" -R "$REPO" --pattern "*.AppImage.tar.gz.sig" -O - 2>/dev/null || echo "")
MACOS_SIG=$(gh release download "$TAG" -R "$REPO" --pattern "*.app.tar.gz.sig" -O - 2>/dev/null || echo "")

python3 - <<PYEOF
import json, sys

with open('latest.json') as f:
    data = json.load(f)

data['version'] = '$VERSION'
data['platforms']['linux-x86_64']['signature'] = """$LINUX_SIG"""
data['platforms']['darwin-aarch64']['signature'] = """$MACOS_SIG"""
data['platforms']['darwin-x86_64']['signature'] = """$MACOS_SIG"""

# Update URLs to match the new tag
for platform, info in data['platforms'].items():
    info['url'] = info['url'].replace(
        info['url'].split('/download/')[1].split('/')[0],
        '$TAG'
    )

with open('latest.json', 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print('latest.json updated for $TAG')
PYEOF

echo "Done. Review latest.json, then:"
echo "  git add latest.json && git commit -m 'chore: update latest.json for $TAG' && git push"
