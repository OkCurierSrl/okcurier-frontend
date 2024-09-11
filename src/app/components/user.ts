export interface UserRole {
  id: string;
  name: string;
  description: string;
}

export interface User {
  email: string;
  name: string;
  picture: string;
  roles: UserRole[];
  sub: string;
}
