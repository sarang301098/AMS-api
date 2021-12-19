declare namespace Express {
  export interface Request {
    user: import('../model/mongo/users').Users;
  }
}
