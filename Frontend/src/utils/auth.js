import { jwtDecode } from 'jwt-decode';

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return true;
    const currentTime = Date.now() / 1000; // in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function isAdminLoggedIn() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) return false;
  if (isTokenExpired(token)) return false;
  return role === 'admin';
}

export function isHRLoggedIn() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) return false;
  if (isTokenExpired(token)) return false;
  return role === 'hr';
}
