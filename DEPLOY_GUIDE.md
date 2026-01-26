# Vercel Deployment Guide

This guide explains how to deploy your **Sing With Lyrics** app to Vercel.

---

## Your Live App URL

🌐 **https://sing-with-lyrics.vercel.app**

---

## How to Deploy Changes

### Step 1: Open Terminal

Open PowerShell or your terminal in the project folder:

```
c:\Users\evari\Documents\---Development\Web\sing-with-lyrics
```

You can do this by:

- Right-clicking in the folder → "Open in Terminal"
- Or using VS Code's integrated terminal

---

### Step 2: Run the Deploy Command

Type this command and press Enter:

```bash
npx vercel --prod
```

**What this does:**

- Builds your app for production
- Uploads files to Vercel's servers
- Deploys to your live URL

**Wait about 30-60 seconds** for the deployment to complete.

---

### Step 3: Done!

When you see the message with your URL, the deployment is complete:

```
Production: https://sing-with-lyrics.vercel.app
```

Your changes are now live! 🎉

---

## If You Need to Login Again

If you see an error like "token is not valid" or "please login", follow these steps:

### Step 1: Run the Login Command

```bash
npx vercel login
```

### Step 2: Authenticate in Browser

1. The terminal will show a link or open your browser automatically
2. If it shows a link, copy and paste it into your browser
3. Sign in with your Vercel account (you used your GitHub/email before)
4. Click "Authorize" when prompted

### Step 3: Confirm Login

You'll see this message in your terminal:

```
Congratulations! You are now signed in.
```

### Step 4: Deploy

Now you can deploy:

```bash
npx vercel --prod
```

---

## Quick Reference

| What You Want        | Command             |
| -------------------- | ------------------- |
| Deploy to production | `npx vercel --prod` |
| Login to Vercel      | `npx vercel login`  |
| Check if logged in   | `npx vercel whoami` |
| Test locally first   | `npm run dev`       |

---

## Troubleshooting

### "Command not found" Error

Make sure you have Node.js installed. Download from: https://nodejs.org

### "Token not valid" Error

You need to login again:

```bash
npx vercel login
```

### "Build failed" Error

Check if the app works locally first:

```bash
npm run dev
```

If it works locally but fails on Vercel, check the error message in the terminal.

---

## Full Workflow Example

1. **Make your code changes**

2. **Test locally:**

   ```bash
   npm run dev
   ```

   Open http://localhost:5174 to check if it works

3. **When happy with changes, deploy:**

   ```bash
   npx vercel --prod
   ```

4. **Wait for success message** - your changes are live!

---

## Project Info

- **Project Name:** sing-with-lyrics
- **Live URL:** https://sing-with-lyrics.vercel.app
- **Dashboard:** https://vercel.com/dashboard

---

_Last updated: January 26, 2026_
