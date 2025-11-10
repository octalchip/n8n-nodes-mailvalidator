# Setup Guide for Email Validator n8n Node

This guide will walk you through setting up the Email Validator node in n8n step by step.

## Prerequisites

- n8n installed and running
- A Google account with access to Google Sheets
- An Email Validator account with API credentials (JWT token or API Key)
- A Google Sheet with email addresses to validate

## Step-by-Step Setup

### Step 1: Install the Node

#### Option A: Install from npm (Recommended)
```bash
npm install n8n-nodes-mailvalidator
```

#### Option B: Install from Source
1. Clone or download this repository
2. Navigate to the `n8n-custom-node` directory
3. Run `npm install && npm run build`
4. Link or copy to `~/.n8n/custom/n8n-nodes-mailvalidator`

### Step 2: Restart n8n

After installation, restart n8n:
```bash
# Stop n8n (Ctrl+C)
# Then restart
npx n8n start
```

### Step 3: Prepare Your Google Sheet

1. Create a new Google Sheet or open an existing one
2. Set up the following columns:
   - **Column A:** `email` - Email addresses to validate
   - **Column B:** `status` - Will be updated with validation status (leave empty initially)

**Example:**
```
| email              | status |
|--------------------|--------|
| user@example.com   |        |
| test@invalid.com   |        |
```

3. Note your Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Example: `1dyiCnsqgqsp7MqWzo2kPzdq8usLEvyw1z3Y-y1Gabso`

### Step 4: Create Credentials

#### 4.1: Create Email Validator API Credential

1. In n8n, go to **Credentials** (left sidebar)
2. Click **"Add Credential"**
3. Search for **"Email Validator API"** and select it
4. Configure the credential:

   **Authentication Type:**
   - Choose **"JWT Bearer Token"** if you have a Supabase Auth token
   - Choose **"API Key"** if you have an API key

   **If using JWT Bearer Token:**
   - **JWT Bearer Token:** Paste your JWT token
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Get it from: Your Supabase Auth session or application

   **If using API Key:**
   - **API Key:** Paste your API key
   - Format: `evapi_...`
   - Get it from: Your Email Validator account settings

5. Click **"Save"**
6. Give it a name like "Email Validator API"

#### 4.2: Create Google Sheets OAuth2 Credential

1. In n8n, go to **Credentials** (left sidebar)
2. Click **"Add Credential"**
3. Search for **"Google Sheets OAuth2 API"** and select it
4. Follow n8n's OAuth2 authentication flow:
   - Click **"Connect my account"**
   - Sign in with your Google account
   - Grant permissions to access Google Sheets
5. Click **"Save"**
6. Give it a name like "Google Sheets Account"

### Step 5: Create Your Workflow

1. In n8n, create a new workflow
2. Add a **Google Sheets Trigger** node:
   - Configure it to trigger on "Row Added"
   - Select your Google Sheets credential
   - Enter your Sheet ID and Sheet Name
3. Add an **Email Validator** node:
   - Connect it after the Google Sheets Trigger

### Step 6: Configure the Email Validator Node

1. Click on the **Email Validator** node
2. In the **Parameters** tab, configure:

   **Credentials (IMPORTANT - Order Matters!):**
   - **First Credential:** Select your **Email Validator API** credential
   - **Second Credential:** Select your **Google Sheets OAuth2** credential

   **Sheet Configuration:**
   - **Google Sheet ID:** 
     - Paste your full Google Sheets URL, OR
     - Just the Sheet ID (e.g., `1dyiCnsqgqsp7MqWzo2kPzdL8usLEv6w1z3Y-y1Gabso`)
   - **Sheet Name:** The name of your sheet tab (e.g., `Sheet1`)
   - **Email Column:** The column name with emails (default: `email`)
   - **Status Column:** The column name for status (default: `status`)

3. Click **"Save"**

### Step 7: Test Your Workflow

1. Add a test email to your Google Sheet
2. Execute the workflow manually or wait for the trigger
3. Check that:
   - The email is validated
   - The status column is updated in your Google Sheet
   - The node output shows the validation result

## Common Issues and Solutions

### Issue: "Invalid authentication token"
**Solution:** 
- Check that your JWT token or API key is correct
- Ensure there are no extra spaces
- Verify the token hasn't expired (for JWT)

### Issue: "Google Sheets authentication failed"
**Solution:**
- Re-authenticate your Google Sheets OAuth2 credential
- Ensure the credential has write permissions
- Check that the sheet is not protected

### Issue: "Column not found"
**Solution:**
- Verify column names match exactly (case-sensitive)
- Check that the sheet name is correct
- Ensure the sheet has a header row

### Issue: Node not appearing
**Solution:**
- Restart n8n completely
- Check that the node is installed correctly
- Verify the `dist/` folder exists

### Issue: Icon not showing
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart n8n
- Hard refresh the page (Ctrl+Shift+R)

## Next Steps

After setup, you can:
- Add conditional logic to route valid emails to Mailchimp, SendGrid, etc.
- Set up automated workflows for email list cleaning
- Integrate with other n8n nodes for complete automation

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review n8n execution logs for error details
- Open an issue on GitHub if you encounter problems

---

**Remember:** The credential order is important! Always select Email Validator API first, then Google Sheets OAuth2.

