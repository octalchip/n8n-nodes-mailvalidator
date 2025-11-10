# Deployment Checklist

Use this checklist before publishing your n8n node to npm or making it publicly available.

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All TypeScript compilation errors resolved
- [x] Node builds successfully (`npm run build`)
- [x] All icons are in place and correctly referenced
- [x] Credential order is correct (Email Validator API first, Google Sheets second)
- [x] Error handling is comprehensive
- [x] Logging is appropriate (not too verbose, not too sparse)

### ✅ Documentation
- [x] README.md is complete and accurate
- [x] SETUP_GUIDE.md provides step-by-step instructions
- [x] INSTALL.md has clear installation steps
- [x] QUICK_START.md provides a fast onboarding path
- [x] All credential setup instructions are clear
- [x] Troubleshooting section is comprehensive

### ✅ Package Configuration
- [x] `package.json` has correct metadata:
  - [x] Name: `n8n-nodes-mailvalidator`
  - [x] Version: `1.0.0`
  - [x] Description is clear and descriptive
  - [x] Keywords include relevant terms
  - [x] Author information is correct
  - [x] Homepage URL is correct
  - [x] Repository URL is correct
  - [x] License is specified (MIT)

### ✅ Node Configuration
- [x] Node name: `emailValidator`
- [x] Display name: `Email Validator`
- [x] Icon is correctly referenced: `file:icon.svg`
- [x] Version is set: `1.1`
- [x] Credentials are in correct order:
  1. `emailValidatorApi` (first)
  2. `googleSheetsOAuth2Api` (second)
- [x] All required parameters are defined
- [x] Parameter descriptions are clear

### ✅ Credential Configuration
- [x] Credential name: `emailValidatorApi`
- [x] Display name: `Email Validator API`
- [x] Icon is correctly referenced: `file:icon.svg`
- [x] Both authentication types are supported:
  - [x] JWT Bearer Token
  - [x] API Key
- [x] Field labels are descriptive
- [x] Placeholders are helpful

### ✅ Build Process
- [x] TypeScript compiles without errors
- [x] Icons are copied to `dist/` folder
- [x] All files are in `dist/` folder:
  - [x] `dist/nodes/EmailValidator/EmailValidator.node.js`
  - [x] `dist/nodes/EmailValidator/icon.svg`
  - [x] `dist/credentials/EmailValidatorApi/EmailValidatorApi.credentials.js`
  - [x] `dist/credentials/EmailValidatorApi/icon.svg`
- [x] `package.json` `files` array includes `dist`

### ✅ Testing
- [x] Node appears in n8n after installation
- [x] Icon displays correctly
- [x] Credentials can be created and saved
- [x] Node executes without errors
- [x] Google Sheets integration works
- [x] Email validation works correctly
- [x] Status updates are written to sheet
- [x] Validation processing works
- [x] Error handling works gracefully

### ✅ User Experience
- [x] Credential order is intuitive (Email Validator first)
- [x] Parameter names are clear
- [x] Error messages are helpful
- [x] Documentation is easy to follow
- [x] Examples are provided

## Pre-Publish Steps

1. **Update version in package.json:**
   ```bash
   npm version patch  # or minor, or major
   ```

2. **Build the package:**
   ```bash
   npm run build
   ```

3. **Test the build locally:**
   ```bash
   # Install in a test n8n instance
   npm install
   # Verify everything works
   ```

4. **Run linting:**
   ```bash
   npm run lint
   ```

5. **Check package contents:**
   ```bash
   npm pack --dry-run
   ```

## Publishing to npm

1. **Login to npm:**
   ```bash
   npm login
   ```

2. **Publish:**
   ```bash
   npm publish
   ```

3. **Verify publication:**
   - Check npm package page
   - Verify all files are included
   - Test installation: `npm install n8n-nodes-mailvalidator`

## Post-Publication

- [ ] Update GitHub repository with latest code
- [ ] Create a release tag
- [ ] Update any external documentation
- [ ] Announce the package (if desired)

## Important Notes

### Credential Order
The credential order is **critical**. Users must select:
1. **Email Validator API** (first)
2. **Google Sheets OAuth2** (second)

This is clearly documented in:
- README.md
- SETUP_GUIDE.md
- QUICK_START.md
- Node parameter descriptions

### Internal Configuration
These values are configured internally for optimal performance:
- API Base URL: `https://api.octalchip.com`
- API Endpoint: `/emailvalidator`
- Batch processing is optimized automatically

### Authentication
The node supports two authentication methods:
- JWT Bearer Token (from Supabase Auth)
- API Key (from account settings)

Both are clearly documented with examples.

---

**Status:** ✅ Ready for deployment

