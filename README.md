# OBITREND SPORTS

Separate OBITREND sports application.

## Current build
- Responsive sports dashboard
- Live match view
- Search and match centre
- Automatic live-data refresh every 30 seconds
- Practice picks using virtual points only
- Vercel API endpoint at /api/live
- Safe demo fallback when no sports-data API key is configured
- Live video placeholder pending appropriate streaming rights

## Live sports data
The server endpoint can use API-Sports / API-Football through the Vercel environment variable `APISPORTS_KEY`. The key is server-side only and is never placed in browser code.

Without the key, the app stays in DEMO DATA mode.

## Not enabled
- Real-money deposits, withdrawals, or wagering
- Unlicensed sports broadcasts

## Next production stages
1. Configure the licensed sports-data provider key.
2. Add Supabase authentication and database.
3. Add match events, lineups, statistics and standings.
4. Add authorized streaming integration when rights are secured.
5. Complete regulatory/compliance work before enabling real-money betting.
