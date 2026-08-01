# Maintenance Mode

The GSC Student Council portal includes a global maintenance mode feature that can be triggered via a Vercel environment variable. This implementation uses Vercel rewrites to redirect traffic to a maintenance page without requiring a full redeploy.

## How to Enable Maintenance Mode

### On Vercel (Production)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `EDGE_CONFIG_IS_IN_MAINTENANCE`
   - **Value**: `true`
   - **Environment**: Select the environments you want (Production, Preview, Development)
4. **No redeploy needed!** The change takes effect immediately on the next request

### Locally (Development)

1. Create or edit the `.env.local` file in your project root
2. Add the following line:
   ```
   EDGE_CONFIG_IS_IN_MAINTENANCE=true
   ```
3. Restart your development server
4. Visit `http://localhost:5173/under-maintenance.html` to see the maintenance page

### To Disable Maintenance Mode

Simply set the environment variable to any value other than `true`, or remove it entirely:
- Vercel: Delete the environment variable or set it to `false`
- Local: Remove the line from `.env.local` or set it to `false`

## How It Works

This implementation uses Vercel's rewrite rules in `vercel.json`:

1. **Environment Check**: The rewrite rule checks if `EDGE_CONFIG_IS_IN_MAINTENANCE` is set to `true`
2. **Bypass Paths**: Static assets (maintenance page, logos, favicons) are excluded from the rewrite
3. **Redirect**: When maintenance mode is enabled, all traffic is redirected to `/under-maintenance.html`
4. **No Redeploy**: Changes take effect immediately without rebuilding the application

## What Happens During Maintenance Mode

When maintenance mode is enabled:
- All normal routes are redirected to the maintenance page
- Static assets still load normally (logos, styles, etc.)
- Users see a clean, modern maintenance page
- The page includes:
  - GSC logo
  - Clear messaging about the maintenance
  - Estimated downtime information
  - Contact information for urgent matters
  - Animated status indicator

## Maintenance Page Features

- **Static HTML**: No JavaScript required, works even if the app fails
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessible**: Proper contrast ratios and semantic HTML
- **Branded**: Uses GSC logo and professional styling
- **Informative**: Provides clear next steps for users
- **Self-Contained**: All CSS is inline, no external dependencies

## Testing Maintenance Mode Locally

To test the maintenance page:

1. Add `EDGE_CONFIG_IS_IN_MAINTENANCE=true` to your `.env.local`
2. Restart your development server
3. Visit `http://localhost:5173/under-maintenance.html` to see the maintenance page
4. To test the redirect behavior, you'll need to deploy to Vercel

## Files Involved

- `public/under-maintenance.html` - The static maintenance page
- `public/gsc_logo.svg` - GSC logo for the maintenance page
- `vercel.json` - Rewrite rules for maintenance mode
- `.env.local` - Local environment variable (not committed to git)

## Notes

- The maintenance mode check happens at the Vercel edge level, before reaching your application
- This ensures that even if your application has errors, the maintenance page will still display
- Static assets are explicitly allowed to pass through so the maintenance page looks correct
- The feature uses Vercel's environment variable system with rewrite rules
- No special build configuration or Edge Config setup is required
