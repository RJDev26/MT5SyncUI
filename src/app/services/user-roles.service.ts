import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserRole {
  userName: string;
  email: string;
  userId: number;
  emailConfirmed: boolean;
  role: string;
  manager: string | null;
  head?: string | null;
  id: string;
  status: string;
}

export interface Manager {
  id: number;
  name: string;
}

export type ManagerMappingAction = 'INSERT' | 'DELETE';

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
    return this.http
      .get<UserRole[]>(this.baseUrl)
      .pipe(map(list => this.normalizeUserRoles(list)));
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
    return this.http
      .get<Manager[]>(`${environment.apiBaseUrl}api/Master/managers`)
      .pipe(map(list => this.normalizeManagerList(list)));
  }

  getUserManagers(userId: number): Observable<Manager[]> {
    return this.http
      .get<Manager[]>(`${this.baseUrl}/${userId}/managers`)
      .pipe(map(list => this.normalizeManagerList(list)));
  }

  updateManagerMapping(
    userId: number,
    managerIds: number[],
    action: ManagerMappingAction
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/manager-mapping`, {
      userId,
      managerIds: managerIds.join(','),
      action,
    });
  }

  private normalizeManagerList(list: Manager[] | null | undefined): Manager[] {
    if (!list) {
      return [];
    }

    return list.map(item => ({
      id: (item as any).managerId ?? item.id,
      name: (item as any).managerName ?? item.name,
    }));
  }

  private normalizeUserRoles(list: UserRole[] | null | undefined): UserRole[] {
    if (!list) {
      return [];
    }

    return list.map(user => ({
      ...user,
      manager: (user as any).manager ?? (user as any).head ?? null,
    }));
  }
}
