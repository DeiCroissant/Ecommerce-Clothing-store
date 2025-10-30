import { NextResponse } from 'next/server';
import { comparePassword, findUserByUsername, findUserByEmail } from '@/lib/auth/authUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
        },
        { status: 400 }
      );
    }

    // Tìm user theo username hoặc email
    const user = findUserByUsername(username) || findUserByEmail(username);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tên đăng nhập hoặc mật khẩu không đúng' 
        },
        { status: 401 }
      );
    }

    // So sánh password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tên đăng nhập hoặc mật khẩu không đúng' 
        },
        { status: 401 }
      );
    }

    // Trả về thành công (không trả về password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Đăng nhập thành công',
        user: userWithoutPassword
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Lỗi server. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    );
  }
}
