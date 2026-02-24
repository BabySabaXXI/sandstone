import { NextResponse } from 'next/server';

export async function GET() {
  const agents = [
    { id: 1, name: 'Supabase Architect', squad: 'Backend', status: 'running', progress: 85, task: 'Database schema' },
    { id: 2, name: 'Auth Specialist', squad: 'Backend', status: 'running', progress: 92, task: 'OAuth flow' },
    { id: 100, name: 'Vercel Integration', squad: 'Deploy', status: 'running', progress: 96, task: 'Integration' },
  ];
  
  return NextResponse.json({ agents, stats: { total: 100, running: 98, completed: 2 } });
}
