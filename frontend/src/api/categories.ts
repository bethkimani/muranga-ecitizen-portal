import { api, unwrap } from './client';

export type ApiCategory = {
  id: number;
  name: string;
  description: string;
  response_target_days: number;
  icon_name: string;
  department: number;
  department_name: string;
};

export type ApiDepartment = {
  id: number;
  name: string;
  description: string;
  head_officer_name: string;
};

export async function getCategories() {
  return unwrap(await api<ApiCategory[] | { results: ApiCategory[] }>('/categories/', { auth: false }));
}

export async function getDepartments() {
  return unwrap(await api<ApiDepartment[] | { results: ApiDepartment[] }>('/departments/', { auth: false }));
}