# Installation Guide

## Quick Start

### For End Users (npm Package)

1. **Install the package:**
   ```bash
   npm install n8n-nodes-mailvalidator
   ```

2. **Restart n8n:**
   ```bash
   # Stop n8n if running (Ctrl+C)
   npx n8n start
   ```

3. **Verify installation:**
   - Open n8n editor (http://localhost:5678)
   - Add a new node
   - Search for "Email Validator"
   - You should see the custom node with the green mail icon

4. **Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) for configuration**

### For Developers (Local Installation)

1. **Install dependencies:**
   ```bash
   cd n8n-custom-node
   npm install
   ```

2. **Build the node:**
   ```bash
   npm run build
   ```

3. **Install to n8n:**
   
   Find your n8n custom nodes directory:
   - Linux/Mac: `~/.n8n/custom/`
   - Windows: `%USERPROFILE%\.n8n\custom\`
   - Docker: `/home/node/.n8n/custom/`
   
   Create the directory if it doesn't exist:
   ```bash
   mkdir -p ~/.n8n/custom
   ```
   
   Link or copy the node:
   ```bash
   # Option 1: Symlink (for development - changes reflect immediately)
   ln -s $(pwd) ~/.n8n/custom/n8n-nodes-mailvalidator
   
   # Option 2: Copy (for production)
   cp -r . ~/.n8n/custom/n8n-nodes-mailvalidator
   ```

4. **Restart n8n:**
   ```bash
   # Stop n8n if running (Ctrl+C)
   # Then restart
   npx n8n start
   ```

5. **Verify installation:**
   - Open n8n editor (http://localhost:5678)
   - Add a new node
   - Search for "Email Validator"
   - You should see the custom node with your logo

## Credential Setup (Quick Reference)

When configuring the Email Validator node, you'll need two credentials in this order:

### 1️⃣ First: Email Validator API
- **Type:** Email Validator API
- **Authentication:** Choose JWT Bearer Token OR API Key
- **JWT Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from Supabase Auth)
- **OR API Key:** `evapi_...` (from your account settings)

### 2️⃣ Second: Google Sheets OAuth2
- **Type:** Google Sheets OAuth2 API (n8n built-in)
- **Permissions:** Read and Write access to Google Sheets
- **Setup:** Follow n8n's OAuth2 flow

**⚠️ Important:** The credential order matters! Always select Email Validator API first, then Google Sheets.

## Troubleshooting

### Node doesn't appear
- ✅ Check that the `dist/` folder was created after build
- ✅ Verify the symlink/copy is in `~/.n8n/custom/`
- ✅ Check n8n logs for errors
- ✅ Restart n8n completely
- ✅ Clear browser cache

### Build errors
- ✅ Make sure you have Node.js 18+ installed
- ✅ Run `npm install` again
- ✅ Check TypeScript version compatibility

### Runtime errors
- ✅ Verify credentials are set correctly
- ✅ Check Google Sheets OAuth2 permissions
- ✅ Review n8n execution logs
- ✅ Ensure credentials are in the correct order

### Icon not showing
- ✅ Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Restart n8n completely
- ✅ Check that `icon.svg` exists in `dist/nodes/EmailValidator/`

## Development

For development with auto-rebuild:
```bash
npm run dev
```

Then restart n8n after each change, or use n8n's development mode.

## Next Steps

After installation, follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed configuration instructions.

For complete documentation, see [README.md](README.md).
