# Custom n8n Node - Email Validator

## Summary

A complete custom n8n node that:
- ✅ Takes emails from Google Sheets Trigger
- ✅ Validates emails using your API (single or bulk)
- ✅ Updates Google Sheets with validation status in real-time
- ✅ Processes emails in configurable batches (default: 5)
- ✅ Waits between batches (default: 5 seconds)
- ✅ Outputs validated emails with status for downstream nodes
- ✅ Includes custom logo/icon

## File Structure

```
n8n-custom-node/
├── package.json                    # Node package configuration
├── tsconfig.json                   # TypeScript configuration
├── gulpfile.js                     # Build script for icons
├── README.md                       # Full documentation
├── INSTALL.md                      # Installation guide
├── .gitignore                      # Git ignore rules
├── credentials/
│   └── EmailValidatorApi/
│       └── EmailValidatorApi.credentials.ts  # API credentials
└── nodes/
    └── EmailValidator/
        ├── EmailValidator.node.ts  # Main node implementation
        ├── GenericFunctions.ts     # Google Sheets API helpers
        └── icon.svg                # Custom logo/icon
```

## Key Features

### 1. Batch Processing
- Processes emails in configurable batches (default: 5)
- Waits between batches to respect rate limits
- Continues processing even if individual emails fail

### 2. Real-time Sheet Updates
- Marks emails as "processing" when validation starts
- Updates status immediately after validation
- Handles errors gracefully

### 3. Flexible Configuration
- Configurable batch size
- Configurable delay between batches
- Supports both single and bulk API endpoints
- Customizable column names

### 4. Status Tracking
- `processing` - Currently being validated
- `valid` - Email is valid and deliverable
- `invalid` - Email is invalid
- `risky` - Email has risk factors
- `unknown` - Cannot determine validity
- `error` - Validation failed

## Next Steps

1. **Install dependencies:**
   ```bash
   cd n8n-custom-node
   npm install
   ```

2. **Build the node:**
   ```bash
   npm run build
   ```

3. **Link to n8n:**
   ```bash
   mkdir -p ~/.n8n/custom
   ln -s $(pwd) ~/.n8n/custom/n8n-nodes-mailvalidator
   ```

4. **Restart n8n and test!**

## Usage in Workflow

```
Google Sheets Trigger (On Row Added)
    ↓
Email Validator Node
    ├─→ Batch 1: 5 emails → Wait 5s
    ├─→ Batch 2: 5 emails → Wait 5s
    └─→ Batch 3: remaining emails
    ↓
Output: Array of validated emails
    ↓
If Node (status = "valid")
    ├─→ Mailchimp (Add to List)
    └─→ End
```

## Notes

- The node requires Google Sheets OAuth2 credentials with read/write access
- The node requires Email Validator API credentials (base URL + API key)
- Row indexing assumes row 1 is headers, so actual data starts at row 2
- The node preserves all original data from the trigger in the output

