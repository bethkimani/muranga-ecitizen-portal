import { api } from '@/api/client';

export type ProfileInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

// Change these two paths if your Django urls.py uses different ones.
const ME_URL = '/auth/me/';
const PASSWORD_URL = '/auth/change-password/';

export function updateProfile(data: ProfileInput) {
  return api(ME_URL, { method: 'PATCH', body: JSON.stringify(data) });
}

export function changePassword(data: { old_password: string; new_password: string }) {
  return api(PASSWORD_URL, { method: 'POST', body: JSON.stringify(data) });
}