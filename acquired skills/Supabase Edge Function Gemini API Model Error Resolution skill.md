# Supabase Edge Function Gemini API Model Error Resolution Skill

## Context & The Problem
While developing a React application integrating with Google's Gemini AI via Supabase Edge Functions, we encountered persistent 400 Bad Request and 500 Internal Server errors when invoking the edge function. 

The user interface displayed:
`Edge Function returned a non-2xx status code`

## The Symptoms
- The Supabase Edge function invocation consistently failed, resulting in immediate ~400ms rejections.
- The logs indicated a `non-2xx status code` returned directly from the Edge Function without deep trace clarity on the client-side.
- The issue occurred when calling Google's Gemini API directly from within the edge function.

## Troubleshooting Steps Taken
1. **Verifying Edge Function Secrets:** We initially checked if the `GEMINI_API_KEY` was correctly stored and injected into the Supabase Edge Function secrets. We re-added and updated the secret but the error persisted.
2. **Implementing Enhanced Debugging:** We augmented the Edge Function with robust error handling and logging to capture the absolute raw status and JSON payload returned by Google's gateway, rather than just bubbling up generic server errors.
3. **Rotating API Keys:** Assumed the key might be rate-limited or invalid. The user deleted the old key and provisioned a brand new API key, but the exact same error persisted.

## The Root Cause and Solution
The problem was not the API key validity nor the Supabase environment secrets. **The root cause was attempting to use an incorrect or deprecated model identifier.**

By switching the model identifier in the Edge Function payload to a correct, supported preview model (`gemini-1.5-flash` or `gemini-3-flash-preview` if applicable via the specific testing track), the integration worked flawlessly. 

### How to Intelligently Solve This in the Future
If you encounter a rapid 400 Bad Request from the Gemini API via a Supabase Edge Function:
1. **Always Verify the Model Name:** Google regularly deprecates older models and introduces new ones. Ensure the `model` parameter strictly matches current documentation (e.g., `gemini-1.5-flash`).
2. **Add Deep Logging:** In your Edge Function, capture `await response.text()` from the fetch call if `!response.ok` before throwing an error. This will immediately reveal if the payload format or model name is rejected by Google.
3. **Check API Key Quotas/Permissions:** If the model name is correct, verify that the Google Cloud project has the Generative Language API enabled and billing attached.
4. **Isolate Client vs Server:** Keep API keys absolutely secure using Supabase Edge Function Secrets (`Deno.env.get('GEMINI_API_KEY')`) and never expose them in the React client.

## Summary
Model identifiers are strict. A 400 response from Gemini when the payload syntax is correct almost universally points to an unsupported or malformed model string. Updating the model to `gemini-3-flash-preview` instantly resolved the "non-2xx status code" error.
