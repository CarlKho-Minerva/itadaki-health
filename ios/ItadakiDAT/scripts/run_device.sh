#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT_DIR/ios/ItadakiDAT/ItadakiDAT.xcodeproj"
SCHEME="ItadakiDAT"
BUNDLE_ID="com.carlkho.itadaki.dat"

DEVICE_ID="${DEVICE_ID:-$(
  xcrun xctrace list devices |
    sed -nE '/== Devices ==/,/== Devices Offline ==/ s/.*iPhone.*\(([0-9A-F]{8}-[0-9A-F]{16})\)$/\1/p' |
    head -n 1
)}"

if [[ -z "$DEVICE_ID" ]]; then
  echo "Could not find a connected iPhone." >&2
  echo "Connect and trust the iPhone, then retry." >&2
  exit 1
fi

echo "Using iPhone: $DEVICE_ID"

if ! xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "platform=iOS,id=$DEVICE_ID" \
  -destination-timeout 15 \
  -configuration Debug \
  -allowProvisioningUpdates \
  build; then
  cat >&2 <<'EOF'

Physical-device build did not complete.

Most likely fixes:
- If Xcode says Developer Mode is disabled:
  iPhone Settings > Privacy & Security > Developer Mode > On, then reboot and reconnect.
- If signing fails:
  Open ios/ItadakiDAT/ItadakiDAT.xcodeproj and confirm the ItadakiDAT target uses team V9WTTPBFK9.
- If Xcode says "No Accounts" or "No profiles":
  Open Xcode > Settings > Accounts, add the Apple ID for team V9WTTPBFK9, then let Xcode create the iOS Development profile.
- If Meta registration opens but fails:
  Replace META_APP_ID = 0 and CLIENT_TOKEN = "" in the ItadakiDAT target Build Settings.
EOF
  exit 1
fi

app_path="$(
  xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration Debug \
    -destination "platform=iOS,id=$DEVICE_ID" \
    -showBuildSettings |
    awk -F' = ' '/ BUILT_PRODUCTS_DIR / { dir=$2 } / FULL_PRODUCT_NAME / { app=$2 } END { print dir "/" app }'
)"

xcrun devicectl device install app --device "$DEVICE_ID" "$app_path"
xcrun devicectl device process launch --device "$DEVICE_ID" --terminate-existing "$BUNDLE_ID"

echo "Installed and launched $BUNDLE_ID on $DEVICE_ID"
