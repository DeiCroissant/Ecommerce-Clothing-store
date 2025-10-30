import { NextResponse } from 'next/server';
import { 
  validatePassword, 
  isNameExists, 
  isDateOfBirthExists,
  hashPassword,
  findUserByEmail,
  findUserByUsername,
  getUsers,
  saveUsers
} from '@/lib/auth/authUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, name, dateOfBirth } = body;

    // Validate input
    if (!username || !email || !password || !name || !dateOfBirth) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vui lòng điền đầy đủ thông tin' 
        },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: passwordValidation.errors.join(', ') 
        },
        { status: 400 }
      );
    }

    // Kiểm tra username đã tồn tại chưa
    if (findUserByUsername(username)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tên đăng nhập đã tồn tại' 
        },
        { status: 400 }
      );
    }

    // Kiểm tra email đã tồn tại chưa
    if (findUserByEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email đã được sử dụng' 
        },
        { status: 400 }
      );
    }

    // Kiểm tra tên đã tồn tại chưa
    if (isNameExists(name)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tên này đã được sử dụng' 
        },
        { status: 400 }
      );
    }

    // Kiểm tra ngày sinh đã tồn tại chưa
    if (isDateOfBirthExists(dateOfBirth)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ngày sinh này đã được sử dụng' 
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      name,
      dateOfBirth,
      createdAt: new Date().toISOString()
    };

    // Lưu user vào file
    const users = getUsers();
    users.push(newUser);
    
    if (!saveUsers(users)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lỗi khi lưu thông tin người dùng' 
        },
        { status: 500 }
      );
    }

    // Trả về thành công (không trả về password)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        success: true, 
        message: 'Đăng ký thành công',
        user: userWithoutPassword
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Lỗi server. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    );
  }
}
