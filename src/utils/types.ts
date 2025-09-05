
export enum UserType {
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
  CLIENT = 'client',

}

export type JWTPayLoadType = {
  id: number;
  userType: UserType;
  sessionId: number; 
};

export type AccessTokenType ={
  accessToken: string

}