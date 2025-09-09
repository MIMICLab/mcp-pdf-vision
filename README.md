# MCP PDF Vision Server

A Model Context Protocol (MCP) server that enables Claude to analyze PDF documents using its vision capabilities.

## Features

- 📄 Direct PDF analysis using Claude's vision capabilities
- 📑 Multi-session support for handling multiple PDFs
- 🔍 Page-by-page navigation and analysis
- 📊 Extract and analyze single pages or page ranges
- 🖼️ Works with complex layouts, tables, charts, and scanned PDFs

## Installation

### Option 1: NPM (Recommended)

```bash
npm install -g mcp-pdf-vision
claude mcp add pdf-vision --scope user -- npx mcp-pdf-vision
```

### Option 2: Manual Installation

```bash
git clone https://github.com/MIMICLab/mcp-pdf-vision.git
cd mcp-pdf-vision
npm install
npm run build
claude mcp add pdf-vision --scope user -- node $(pwd)/dist/index.js
```

### Option 3: Quick Install Script

```bash
curl -sSL https://raw.githubusercontent.com/MIMICLab/mcp-pdf-vision/main/install.sh | bash
```

## Usage in Claude Code

### Verify Installation

```bash
claude mcp list
# Should show: pdf-vision ✓ Connected
```

### Basic Commands

```
# Load a PDF
"Load /path/to/document.pdf using pdf-vision"

# View current page
"Show me the current page"

# Navigate pages
"Go to next page"
"Go to page 5"

# Analyze content
"Analyze the table on this page"
"Summarize pages 1-5"
```

### Available Tools

1. **load_pdf** - Load a PDF file for analysis
   - `pdfPath`: Path to the PDF file
   - `sessionId`: Optional session identifier

2. **get_current_page** - Get the current page as an image
   - `sessionId`: Session ID of the loaded PDF
   - `dpi`: Resolution for image extraction (default: 150)

3. **go_to_page** - Navigate to a specific page
   - `sessionId`: Session ID
   - `pageNumber`: Target page number (1-indexed)

4. **next_page** / **previous_page** - Navigate between pages
   - `sessionId`: Session ID

5. **get_pages_range** - Get multiple pages at once
   - `sessionId`: Session ID
   - `startPage`: Starting page number
   - `endPage`: Ending page number
   - `dpi`: Resolution (default: 150)

6. **get_all_pages** - Get all pages from the PDF
   - `sessionId`: Session ID
   - `dpi`: Resolution (default: 150)

7. **get_pdf_info** - Get information about the loaded PDF
   - `sessionId`: Session ID

8. **list_sessions** - List all active PDF sessions

## Configuration

### Claude Code (CLI)

The server is automatically configured when installed via npm or the install script.

Manual configuration in `~/.claude.json`:

```json
{
  "mcpServers": {
    "pdf-vision": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-pdf-vision/dist/index.js"]
    }
  }
}
```

### Claude Desktop App

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "pdf-vision": {
      "command": "npx",
      "args": ["mcp-pdf-vision"]
    }
  }
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/MIMICLab/mcp-pdf-vision.git
cd mcp-pdf-vision

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Test locally
claude mcp add pdf-vision-dev --scope project -- node $(pwd)/dist/index.js
```

## Troubleshooting

### Server not appearing in `/mcp` list

1. Restart Claude Code completely
2. Check server status: `claude mcp list`
3. Reinstall: `npm uninstall -g mcp-pdf-vision && npm install -g mcp-pdf-vision`

### PDF loading errors

- Ensure the PDF path is absolute, not relative
- Check file permissions
- Verify the PDF is not corrupted

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Taehoon Kim - [MIMICLab](https://github.com/MIMICLab)