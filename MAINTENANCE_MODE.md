# Maintenance Mode

The GSC Student Council portal includes a global maintenance mode feature that can be triggered via a Vercel environment variable.

## How to Enable Maintenance Mode

### On Vercel (Production)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `VITE_UNDER_MAINTENANCE`
   - **Value**: `true`
   - **Environment**: Select the environments you want (Production, Preview, Development)
4. Redeploy your project

### Locally (Development)

1. Create or edit the `.env.local` file in your project root
2. Add the following line:
   ```
   VITE_UNDER_MAINTENANCE=true
   ```
3. Restart your development server

### To Disable Maintenance Mode

Simply set the environment variable to any value other than `true`, or remove it entirely:
- Vercel: Delete the environment variable or set it to `false`
- Local: Remove the line from `.env.local` or set it to `false`

## What Happens During Maintenance Mode

When maintenance mode is enabled:
- All normal routes are bypassed
- Users see a clean, modern maintenance page
- The page includes:
  - GSC logo
  - Clear messaging about the maintenance
  - Estimated downtime information
  - Contact information for urgent matters
  - Animated status indicator

## Maintenance Page Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessible**: Proper contrast ratios and semantic HTML
- **Branded**: Uses GSC colors and logo
- **Informative**: Provides clear next steps for users
- **Professional**: Clean, modern UI that reflects well on the organization

## Testing Maintenance Mode Locally

To test the maintenance page without affecting the environment variable:

1. Temporarily add `VITE_UNDER_MAINTENANCE=true` to your `.env.local`
2. Run `npm run dev`
3. Visit `http://localhost:5173`
4. You should see the maintenance page
5. Remove the line from `.env.local` to return to normal operation

## Notes

- The maintenance mode check happens at the application entry point, before any routing
- This ensures that even if routes change, the maintenance page will always display
- The feature uses Vite's environment variable system (`import.meta.env`)
- No special build configuration is required
