# Security Architecture (SECURITY.md) - QuDaMemo

## 1. API Keys
- Custom Gemini API keys remain in server memory or local storage. They are never transmitted to third parties.

## 2. File Isolation
- Restricted to reading/writing within configured `storagePath` boundaries.
