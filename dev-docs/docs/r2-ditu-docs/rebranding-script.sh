#!/bin/bash

# R2 Ditu Rebranding Script
# This script helps complete the remaining rebranding tasks

set -e

echo "🎨 R2 Ditu Rebranding Script"
echo "=============================="

# Function to show progress
show_progress() {
    echo "✅ $1"
}

# Function to show pending tasks
show_pending() {
    echo "⏳ $1"
}

# Function to show warnings
show_warning() {
    echo "⚠️  $1"
}

echo ""
echo "📊 Current Status:"
echo "=================="

# Check completed tasks
if grep -q "R2 Ditu" excalidraw-app/index.html; then
    show_progress "HTML meta tags updated"
else
    show_pending "HTML meta tags need updating"
fi

if grep -q "R2 Ditu" packages/common/src/constants.ts; then
    show_progress "App name constant updated"
else
    show_pending "App name constant needs updating"
fi

if grep -q "r2-ditou.robinsai.world" public/robots.txt; then
    show_progress "Robots.txt updated"
else
    show_pending "Robots.txt needs updating"
fi

echo ""
echo "🔄 Next Steps:"
echo "=============="

show_pending "1. Update package.json files (20+ files)"
show_pending "2. Update CSS class names (100+ occurrences)"
show_pending "3. Replace visual assets (favicons, logos, OG images)"
show_pending "4. Update localization files (50+ files)"
show_pending "5. Rename directories (excalidraw-app → r2-ditu-app)"

echo ""
echo "📋 Quick Commands:"
echo "=================="

echo "# Find all package.json files:"
echo "find . -name 'package.json' -not -path './node_modules/*'"

echo ""
echo "# Find all CSS class references:"
echo "grep -r 'excalidraw-' --include='*.tsx' --include='*.ts' --include='*.css' ."

echo ""
echo "# Find all locale files:"
echo "find packages/excalidraw/locales -name '*.json'"

echo ""
echo "# Count remaining 'excalidraw' references:"
echo "grep -r 'excalidraw' --exclude-dir=node_modules --exclude-dir=.git . | wc -l"

echo ""
echo "🎯 Priority Order:"
echo "=================="
echo "1. HIGH: Package names and dependencies"
echo "2. HIGH: Visual assets (favicons, logos)"
echo "3. MEDIUM: CSS class names"
echo "4. MEDIUM: Localization files"
echo "5. LOW: Directory renames (requires build script updates)"

echo ""
echo "⚠️  Important Notes:"
echo "==================="
show_warning "Test all changes in a staging environment first"
show_warning "Update DNS records before deploying"
show_warning "Coordinate with team before publishing new NPM packages"
show_warning "Keep backups of original assets"

echo ""
echo "📚 Documentation:"
echo "=================="
echo "- Branding audit: dev-docs/docs/r2-ditu-docs/branding-audit.csv"
echo "- Summary report: dev-docs/docs/r2-ditu-docs/rebranding-summary.md"
echo "- This script: dev-docs/docs/r2-ditu-docs/rebranding-script.sh"

echo ""
echo "🚀 Ready to continue rebranding!"