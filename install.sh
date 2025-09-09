#!/bin/bash

# MCP PDF Vision Server Installation Script

echo "📦 Installing MCP PDF Vision Server..."

# Install the package globally
npm install -g mcp-pdf-vision

# Get the installation path
INSTALL_PATH=$(npm list -g mcp-pdf-vision --depth=0 --json | jq -r '.dependencies["mcp-pdf-vision"].resolved' | sed 's|file:||')

if [ -z "$INSTALL_PATH" ]; then
  INSTALL_PATH=$(npm root -g)/mcp-pdf-vision
fi

echo "✅ Package installed at: $INSTALL_PATH"

# Configure Claude Code
echo "🔧 Configuring Claude Code..."

# Add to Claude Code configuration
claude mcp add pdf-vision --scope user -- node "$INSTALL_PATH/dist/index.js"

echo "✨ Installation complete!"
echo ""
echo "📋 Usage:"
echo "  1. Run 'claude mcp list' to verify the server is connected"
echo "  2. Use '/mcp' in Claude Code to see available tools"
echo "  3. Example: 'Load test.pdf using pdf-vision'"