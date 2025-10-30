import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'src/lib/auth/users.json');

/**
 * Đọc danh sách users từ file
 */
export function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Lưu danh sách users vào file
 */
export function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

/**
 * Validate password theo yêu cầu:
 * - Dài 8 ký tự
 * - Có ít nhất 1 chữ hoa
 * - Có ít nhất 1 ký tự đặc biệt
 */
export function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Kiểm tra xem tên đã tồn tại chưa
 */
export function isNameExists(name) {
  const users = getUsers();
  return users.some(user => 
    user.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Kiểm tra xem ngày sinh đã tồn tại chưa
 */
export function isDateOfBirthExists(dateOfBirth) {
  const users = getUsers();
  return users.some(user => user.dateOfBirth === dateOfBirth);
}

/**
 * Hash password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * So sánh password với hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Tìm user theo username hoặc email
 */
export function findUserByUsername(username) {
  const users = getUsers();
  return users.find(user => user.username === username);
}

/**
 * Tìm user theo email
 */
export function findUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email === email);
}
