import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserRole {
  userName: string;
  email: string;
  userId: number;
  emailConfirmed: boolean;
  role: string;
  head: string | null;
  id: string;
  status: string;
}

export interface Manager {
  id: number;
  name: string;
}

export interface CreateUserRoleRequest {
  userName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserRoleRequest {
  userName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserRolesService {
  private readonly baseUrl = environment.apiBaseUrl + 'api/Users';

  constructor(private http: HttpClient) {}

  getUserRoles(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(this.baseUrl);
  }

  createUserRole(payload: CreateUserRoleRequest): Observable<UserRole> {
    return this.http.post<UserRole>(this.baseUrl, payload);
  }

  updateUserRole(id: string, payload: UpdateUserRoleRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  resetPassword(id: string, payload: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/reset-password`, payload);
  }

  getManagers(): Observable<Manager[]> {
    return this.http.get<Manager[]>(`${environment.apiBaseUrl}api/Master/managers`);
  }
}
