# Quick Start Guide

Get up and running with the Email Validator n8n node in 5 minutes!

## Installation

```bash
npm install n8n-nodes-mailvalidator
```

Restart n8n, then search for "Email Validator" in the node list.

## Setup Checklist

### ✅ Step 1: Prepare Google Sheet
- Create a sheet with `email` and `status` columns
- Note your Sheet ID from the URL

### ✅ Step 2: Create Credentials

**First Credential - Email Validator API:**
1. Go to n8n Credentials → Add Credential
2. Select "Email Validator API"
3. Choose authentication type:
   - **JWT Bearer Token:** Paste your Supabase Auth token
   - **API Key:** Paste your API key (`evapi_...`)
4. Save

**Second Credential - Google Sheets:**
1. Go to n8n Credentials → Add Credential
2. Select "Google Sheets OAuth2 API"
3. Follow OAuth2 flow to authenticate
4. Save

### ✅ Step 3: Configure Node

1. Add Email Validator node to your workflow
2. **Select credentials in order:**
   - First: Email Validator API
   - Second: Google Sheets OAuth2
3. Configure:
   - **Google Sheet ID:** Your sheet ID or full URL
   - **Sheet Name:** `Sheet1` (or your sheet name)
   - **Email Column:** `email`
   - **Status Column:** `status`
4. Save and test!

## Credential Order (IMPORTANT!)

⚠️ **Always select credentials in this order:**
1. Email Validator API (first)
2. Google Sheets OAuth2 (second)

## Example Workflow

```
Google Sheets Trigger (On Row Added)
    ↓
Email Validator Node
    ↓
If Node (status = "valid")
    ├─→ Mailchimp (Add to List)
    └─→ End
```

## Status Values

The node updates the `status` column with:
- `valid` - Email is valid and deliverable
- `invalid` - Email is invalid
- `risky` - Email has risk factors
- `unknown` - Cannot determine validity
- `processing` - Currently validating
- `error` - Validation error

## Need Help?

- 📖 Full documentation: [README.md](README.md)
- 🔧 Detailed setup: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- 🐛 Issues? Check n8n execution logs

---

**Pro Tip:** The node provides fast, reliable email validation with automatic credit management!

