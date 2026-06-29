export interface JwtPayload {
  userId: string;
  email?: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
