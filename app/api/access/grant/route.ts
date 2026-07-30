import { NextRequest, NextResponse } from 'next/server';
import { grantSdkAccess } from '@/lib/db/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = grantSdkAccess(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        apiKey: user.api_key,
        sdkAccessGranted: !!user.sdk_access_granted,
      },
    });
  } catch (error: any) {
    console.error('Grant access error:', error);
    return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 });
  }
}
