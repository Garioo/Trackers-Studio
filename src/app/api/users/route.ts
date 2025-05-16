import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET all users with optional search
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query: any = {};
    
    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }
    
    if (activeOnly) {
      query.isActive = true;
    }

    const users = await User.find(query)
      .select('username createdAt stats isActive')
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST a new user
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const newUser = new User({ username });
    await newUser.save();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH update a user
export async function PATCH(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, username, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (username && username !== user.username) {
      // Check if new username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
      user.username = username;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Instead of actually deleting, we'll just mark as inactive
    user.isActive = false;
    await user.save();

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 