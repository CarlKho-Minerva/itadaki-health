#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
PROJECT="$ROOT_DIR/ios/ItadakiDAT/ItadakiDAT.xcodeproj"
SCHEME="ItadakiDAT"
BUNDLE_ID="com.carlkho.itadaki.dat"
SIM_NAME="${SIM_NAME:-iPhone 17 Pro Max}"
SCREENSHOT_PATH="${SCREENSHOT_PATH:-/tmp/itadaki-sim.png}"

device_id="$(
  xcrun simctl list devices available |
    grep -F "$SIM_NAME" |
    sed -nE 's/.*\(([0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12})\).*/\1/p' |
    head -n 1
)"

if [[ -z "$device_id" ]]; then
  echo "Could not find an available simulator named '$SIM_NAME'." >&2
  echo "Set SIM_NAME to another simulator name and retry." >&2
  exit 1
fi

xcodebuild \
  -project "$PROJECT" \
  -scheme "$SCHEME" \
  -destination "id=$device_id" \
  -configuration Debug \
  build

xcrun simctl boot "$device_id" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$device_id" -b

app_path="$(
  xcodebuild \
    -project "$PROJECT" \
    -scheme "$SCHEME" \
    -configuration Debug \
    -destination "id=$device_id" \
    -showBuildSettings |
    awk -F' = ' '/ BUILT_PRODUCTS_DIR / { dir=$2 } / FULL_PRODUCT_NAME / { app=$2 } END { print dir "/" app }'
)"

xcrun simctl terminate "$device_id" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl uninstall "$device_id" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl install "$device_id" "$app_path"
xcrun simctl launch "$device_id" "$BUNDLE_ID"
sleep 4
xcrun simctl io "$device_id" screenshot "$SCREENSHOT_PATH"

echo "Launched $BUNDLE_ID on $SIM_NAME ($device_id)"
echo "Screenshot: $SCREENSHOT_PATH"
