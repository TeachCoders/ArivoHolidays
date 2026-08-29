export interface User {
  id: number;
  name: string;
  email: string;
}

export interface onPayload {
  name: string;
  description: string;
  users?: User[];
}