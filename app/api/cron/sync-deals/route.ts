import { NextResponse } from 'next/server';
import { syncDeals } from '@/scripts/scrape';

export async function GET(request: Request) {
  // Protect the cron endpoint, ensuring it's only called by authorized clients (e.g. Vercel Cron)
  const authHeader = request.headers.get('authorization');
  
  // In production, you would check against process.env.CRON_SECRET
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized attempt to access cron endpoint.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Cron Job Triggered: Starting Deal Sync...');

  try {
    const result = await syncDeals();
    console.log(`Cron Job Success: Synced ${result.count} deals.`);
    return NextResponse.json({ success: true, message: `Synced ${result.count} deals.` });
  } catch (error) {
    console.error('Cron Job Failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
