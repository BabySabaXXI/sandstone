import { NextResponse } from 'next/server';
import { swarmExecutor } from '@/lib/swarm/parallel-executor';

export async function POST() {
  try {
    swarmExecutor.executeAll();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Swarm execution started',
      totalAgents: 100 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to start swarm' },
      { status: 500 }
    );
  }
}
