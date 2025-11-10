# n8n Email Validator Custom Node

A powerful custom n8n node that validates emails from Google Sheets, updates the sheet with validation status in real-time, and processes emails in batches with automatic delays.

## ✨ Features

- ✅ **Comprehensive Email Validation** - Validates emails using comprehensive checks (syntax, MX records, SMTP, disposable, role-based, honeypot, Pwned, domain reputation)
- ✅ **Google Sheets Integration** - Reads emails from and updates validation status back to Google Sheets
- ✅ **Real-time Updates** - Updates sheet status immediately as emails are validated
- ✅ **Batch Processing** - Processes emails in batches with automatic delays for optimal performance
- ✅ **Credit Management** - Automatically processes validation results and manages credits via API
- ✅ **API Key Authentication** - Secure authentication using API Key
- ✅ **Error Handling** - Graceful error handling with detailed status tracking
- ✅ **Custom Icon** - Beautiful custom icon matching your brand

## 📦 Installation

### Option 1: npm Package (Recommended for Production)

1. **Install the package:**
   ```bash
   npm install n8n-nodes-mailvalidator
   ```

2. **Restart n8n:**
   ```bash
   # Stop n8n if running (Ctrl+C)
   # Then restart
   npx n8n start
   ```

3. **Verify installation:**
   - Open n8n editor (http://localhost:5678)
   - Add a new node
   - Search for "Email Validator"
   - You should see the custom node with the green mail icon

### Option 2: Local Development

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   cd n8n-custom-node
   npm install
   ```

3. **Build the node:**
   ```bash
   npm run build
   ```

4. **Link to n8n:**
   ```bash
   # Find your n8n custom nodes directory
   # Usually: ~/.n8n/custom or /home/user/.n8n/custom
   
   # Create custom directory if it doesn't exist
   mkdir -p ~/.n8n/custom
   
   # Link the node (for development)
   ln -s $(pwd) ~/.n8n/custom/n8n-nodes-mailvalidator
   
   # OR copy the node (for production)
   cp -r . ~/.n8n/custom/n8n-nodes-mailvalidator
   ```

5. **Restart n8n:**
   ```bash
   # Stop n8n if running (Ctrl+C)
   # Then restart
   npx n8n start
   ```

## 🔧 Setup Guide

### Step 1: Create Credentials (IMPORTANT: Order Matters!)

When configuring the Email Validator node, you'll be asked for two credentials. **The order is important:**

#### 1️⃣ First Credential: Email Validator API

1. Click on **"Credential to connect with (Email Validator account)"** (the first credential field)
2. Click **"Create New Credential"** or select an existing one
3. Choose **"Email Validator API"** from the credential type dropdown
4. Configure the credential:
   - **API Key:** Paste your API key
     - Format: `evapi_...`
     - Get it from: Your account settings in the Email Validator dashboard
5. Click **"Save"**

**Note:** The API Base URL is fixed to `https://api.octalchip.com` and cannot be changed.

#### 2️⃣ Second Credential: Google Sheets OAuth2

1. Click on **"Credential to connect with (Google Sheets account)"** (the second credential field)
2. Click **"Create New Credential"** or select an existing one
3. Choose **"Google Sheets OAuth2 API"** from n8n's built-in credentials
4. Follow n8n's OAuth2 flow to authenticate with Google
5. Ensure the credential has **read and write** access to your Google Sheets
6. Click **"Save"**

### Step 2: Configure Your Google Sheet

Your Google Sheet should have at least these columns:

| Column Name | Description | Example |
|------------|-------------|---------|
| `email` | Email addresses to validate | `user@example.com` |
| `status` | Validation status (auto-updated) | `valid`, `invalid`, `risky`, `unknown`, `processing`, `error` |

**Example Sheet Structure:**
```
| email              | status    |
|--------------------|-----------|
| user@example.com   |           |
| test@invalid.com   |           |
| admin@company.com  |           |
```

The node will automatically update the `status` column with validation results.

### Step 3: Configure the Node

1. **Add the Email Validator node** to your workflow (typically after a Google Sheets Trigger)

2. **Configure node parameters:**
   - **Credential to connect with (Email Validator account):** Select your Email Validator API credential (first credential)
   - **Credential to connect with (Google Sheets account):** Select your Google Sheets OAuth2 credential (second credential)
   - **Google Sheet ID:** 
     - You can paste the full Google Sheets URL: `https://docs.google.com/spreadsheets/d/1dyiCnsqgqsp7MqWzo2kPzdq8usLEvyw1z3Y-y1Gabso/edit`
     - Or just the Sheet ID: `1dyiCnsqgqsp7MqWzo2kPzdq8usLEvyw1z3Y-y1Gabso`
   - **Sheet Name:** The name of the sheet tab (e.g., `Sheet1`, `Data`, `Emails`)
   - **Email Column:** The column name containing email addresses (default: `email`)
   - **Status Column:** The column name for validation status (default: `status`)

3. **Save the workflow**

## 📋 Usage Example

### Basic Workflow

```
Google Sheets Trigger (On Row Added)
    ↓
Email Validator Node
    ├─→ Validates emails
    ├─→ Updates sheet with status
    ├─→ Processes in optimized batches
    └─→ Manages credits automatically
    ↓
If Node (status = "valid")
    ├─→ True: Mailchimp (Add to List)
    └─→ False: End
```

### Workflow Steps

1. **Google Sheets Trigger** - Triggers when a new row is added to your sheet
2. **Email Validator Node** - Validates the email and updates the sheet
3. **Conditional Logic** - Route valid emails to your email marketing tool (Mailchimp, SendGrid, etc.)

## 📊 Node Output

The node outputs validated emails with the following structure:

```json
{
  "email": "user@example.com",
  "status": "valid",
  "validationDetails": {
    "success": true,
    "data": {
      "email": "user@example.com",
      "status": "valid",
      "syntaxValid": true,
      "mxRecord": true,
      "smtpConnection": true,
      "disposable": false,
      "roleBased": false,
      "deliverabilityScore": 95,
      ...
    }
  }
}
```

## 🎯 Status Values

The node updates the status column with one of these values:

| Status | Description |
|--------|-------------|
| `processing` | Email is currently being validated |
| `valid` | Email is valid and deliverable |
| `invalid` | Email is invalid or not deliverable |
| `risky` | Email has some risk factors (disposable, role-based, etc.) |
| `unknown` | Cannot determine validity (timeout, network issues) |
| `error` | Validation failed due to an error |

## 🔍 How It Works

1. **Email Validation:** The node performs comprehensive email validation:
   - Syntax validation
   - MX record check
   - SMTP connection test
   - Disposable email detection
   - Role-based email detection
   - Honeypot detection
   - Have I Been Pwned check
   - Domain reputation check

2. **Sheet Updates:** The node updates the Google Sheet in real-time:
   - Sets status to `processing` when validation starts
   - Updates status with the final validation result
   - Preserves all other column data

3. **Credit Management:** After validation, the node automatically manages credits:
   - Validation results are processed via API after successful validation
   - If processing fails, validation still completes

4. **Batch Processing:** 
   - Processes emails in optimized batches
   - Includes automatic delays between batches
   - Continues processing even if individual emails fail

## 🛠️ Troubleshooting

### Node not appearing in n8n
- ✅ Check that the node is installed correctly
- ✅ Restart n8n after installation
- ✅ Check n8n logs for errors
- ✅ Verify the `dist/` folder exists after build

### Credential errors
- ✅ **"Invalid authentication token"** - Check your API key is correct
- ✅ **"Google Sheets authentication failed"** - Re-authenticate your Google Sheets OAuth2 credentials
- ✅ Ensure credentials are in the correct order (Email Validator API first, Google Sheets second)

### Google Sheets update fails
- ✅ Verify OAuth2 credentials have **write** access to your Google Sheets
- ✅ Check that column names match exactly (case-sensitive)
- ✅ Ensure sheet ID and sheet name are correct
- ✅ Make sure the sheet is not protected or read-only

### Validation not working
- ✅ Check that emails are in the correct column
- ✅ Verify the email column name matches your configuration
- ✅ Check n8n execution logs for detailed error messages
- ✅ Ensure you have sufficient credits in your account

### Icon not showing
- ✅ Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Restart n8n completely
- ✅ Check that `icon.svg` exists in `dist/nodes/EmailValidator/`

## 📝 Configuration Details

### Configurable Values

- **Google Sheet ID:** Your Google Sheet ID or full URL
- **Sheet Name:** The name of the sheet tab
- **Email Column:** Column name containing emails
- **Status Column:** Column name for validation status

**Note:** The API Base URL is configured to `https://api.octalchip.com` and batch processing is optimized automatically.

## 🔐 Authentication

The node uses API Key authentication:

### API Key
- **Format:** `ApiKey <your-api-key>`
- **Where to get it:** From your Email Validator account settings
- **Example:** `ApiKey evapi_1234567890abcdef`

## 📚 API Documentation

For detailed API documentation, visit:
- **Base URL:** `https://mailvalidator.octalchip.com/docs`

## 🚀 Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Lint
```bash
npm run lint
npm run lintfix
```

### Format
```bash
npm run format
```

## 📄 License

MIT

## 🤝 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review n8n execution logs for detailed error messages

## 🙏 Credits

Built with ❤️ for the n8n community

---
