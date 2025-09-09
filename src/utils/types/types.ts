
export type JWTPayLoadType = {
  id: number;
  userType: import('../enums').UserType;
  sessionId: number; 
};

export type AccessTokenType ={
  accessToken: string

}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type DeviceInfo = {
  ip?: string | string[];
  userAgent?: string;
  platform?: string;
  [key: string]: any;
};

export type PaginationQuery = {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  keyword?: string;
  [key: string]: any;
};

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;