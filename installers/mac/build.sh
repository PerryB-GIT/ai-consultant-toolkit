#!/bin/bash
# Build script for Support Forge macOS .pkg installer
# Requires: macOS + Xcode Command Line Tools (xcode-select --install)
# Run from: installers/mac/

set -e

COMPONENT_PKG="flat/SupportForge-AI-Setup-component.pkg"
FINAL_PKG="SupportForge-AI-Setup.pkg"
IDENTIFIER="com.supportforge.aisetup"
VERSION="1.0.0"
INSTALL_LOCATION="/"

echo "============================================"
echo " Support Forge AI Setup - macOS Builder"
echo "============================================"
echo ""

# Check for required tools
for tool in pkgbuild productbuild; do
    if ! command -v $tool &>/dev/null; then
        echo "ERROR: $tool not found. Install Xcode Command Line Tools:"
        echo "  xcode-select --install"
        exit 1
    fi
done

# Clean old build artifacts
rm -f "$COMPONENT_PKG" "$FINAL_PKG"
mkdir -p flat

# Step 1: Build component package (payload + postinstall script)
echo "Building component package..."
pkgbuild \
    --root root \
    --scripts scripts \
    --identifier "$IDENTIFIER" \
    --version "$VERSION" \
    --install-location "$INSTALL_LOCATION" \
    "$COMPONENT_PKG"

echo "Component package built: $COMPONENT_PKG"

# Step 2: Build final product archive (welcome screen + distribution XML)
echo "Building final installer package..."
productbuild \
    --distribution resources/distribution.xml \
    --resources resources \
    --package-path flat \
    "$FINAL_PKG"

echo ""
echo "============================================"
echo " BUILD SUCCESSFUL"
echo " Output: installers/mac/$FINAL_PKG"
echo "============================================"
echo ""
echo "File size:"
du -sh "$FINAL_PKG"
echo ""
echo "To test: open $FINAL_PKG"
