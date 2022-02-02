export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ErrorOutput = {
  __typename?: 'ErrorOutput';
  errorType?: Maybe<Scalars['String']>;
  message?: Maybe<Scalars['String']>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type GamedigServerInfo = {
  __typename?: 'GamedigServerInfo';
  connect: Scalars['String'];
  map: Scalars['String'];
  maxplayers: Scalars['Float'];
  message: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['Boolean'];
  ping: Scalars['Float'];
  players: Array<Player>;
  raw: RawInfo;
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: UserResponse;
  login: UserResponse;
  logout: Scalars['Boolean'];
  register: UserResponse;
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String'];
  token: Scalars['String'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  usernameOrEmail: Scalars['String'];
};


export type MutationRegisterArgs = {
  options: UsernamePasswordInput;
};

export type Player = {
  __typename?: 'Player';
  name: Scalars['String'];
  raw: Score;
};

export type Query = {
  __typename?: 'Query';
  getMultiplesServerInfo?: Maybe<Array<ServerResponse>>;
  getServerGroupByHost?: Maybe<Array<ServerResponse>>;
  getServerGroupByPort?: Maybe<Array<ServerResponse>>;
  getServerInfo?: Maybe<ServerResponse>;
  me?: Maybe<User>;
};


export type QueryGetMultiplesServerInfoArgs = {
  apikey: Scalars['String'];
  servers: Array<ServerInput>;
};


export type QueryGetServerGroupByHostArgs = {
  apikey: Scalars['String'];
  host: Scalars['String'];
  ports: Array<Scalars['Int']>;
  type: Scalars['String'];
};


export type QueryGetServerGroupByPortArgs = {
  apikey: Scalars['String'];
  host: Array<Scalars['String']>;
  ports: Scalars['Int'];
  type: Scalars['String'];
};


export type QueryGetServerInfoArgs = {
  apikey: Scalars['String'];
  server: ServerInput;
};

export type RawInfo = {
  __typename?: 'RawInfo';
  appId?: Maybe<Scalars['Int']>;
  folder?: Maybe<Scalars['String']>;
  game?: Maybe<Scalars['String']>;
  numbots?: Maybe<Scalars['Int']>;
  numplayers?: Maybe<Scalars['Int']>;
  protocol?: Maybe<Scalars['Int']>;
  secure?: Maybe<Scalars['Int']>;
  tags?: Maybe<Array<Scalars['String']>>;
  version?: Maybe<Scalars['String']>;
};

export type Role = {
  __typename?: 'Role';
  id: Scalars['Float'];
  role: Scalars['String'];
};

export type Score = {
  __typename?: 'Score';
  score?: Maybe<Scalars['String']>;
  time?: Maybe<Scalars['String']>;
};

export type ServerInput = {
  host: Scalars['String'];
  port: Scalars['Int'];
  type: Scalars['String'];
};

export type ServerResponse = {
  __typename?: 'ServerResponse';
  errors?: Maybe<Array<ErrorOutput>>;
  response?: Maybe<GamedigServerInfo>;
};

export type User = {
  __typename?: 'User';
  apiKey?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['Float'];
  roles: Array<Role>;
  updatedAt: Scalars['String'];
  username: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type UsernamePasswordInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type MinimalServerInfoFragment = { __typename?: 'GamedigServerInfo', name: string, map: string, maxplayers: number, connect: string, raw: { __typename?: 'RawInfo', numplayers?: number | null } };

export type RegularUserFragment = { __typename?: 'User', id: number, username: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, username: string } | null };

export type GetServerInfoQueryVariables = Exact<{
  apikey: Scalars['String'];
  host: Scalars['String'];
  port: Scalars['Int'];
  type: Scalars['String'];
}>;


export type GetServerInfoQuery = { __typename?: 'Query', getServerInfo?: { __typename?: 'ServerResponse', response?: { __typename?: 'GamedigServerInfo', name: string, map: string, maxplayers: number, password: boolean, connect: string, ping: number, raw: { __typename?: 'RawInfo', numplayers?: number | null, protocol?: number | null, folder?: string | null, game?: string | null, appId?: number | null, numbots?: number | null, secure?: number | null, version?: string | null, tags?: Array<string> | null }, players: Array<{ __typename?: 'Player', name: string, raw: { __typename?: 'Score', score?: string | null } }> } | null, errors?: Array<{ __typename?: 'ErrorOutput', errorType?: string | null, message?: string | null }> | null } | null };

export type GetMinimalServerinfoQueryVariables = Exact<{
  apikey: Scalars['String'];
  host: Scalars['String'];
  port: Scalars['Int'];
  type: Scalars['String'];
}>;


export type GetMinimalServerinfoQuery = { __typename?: 'Query', getServerInfo?: { __typename?: 'ServerResponse', response?: { __typename?: 'GamedigServerInfo', name: string, map: string, maxplayers: number, connect: string, raw: { __typename?: 'RawInfo', numplayers?: number | null } } | null } | null };

export type GetMultiplesMinimalServerInfoQueryVariables = Exact<{
  apikey: Scalars['String'];
  servers: Array<ServerInput> | ServerInput;
}>;


export type GetMultiplesMinimalServerInfoQuery = { __typename?: 'Query', getMultiplesServerInfo?: Array<{ __typename?: 'ServerResponse', response?: { __typename?: 'GamedigServerInfo', name: string, map: string, maxplayers: number, connect: string, raw: { __typename?: 'RawInfo', numplayers?: number | null } } | null }> | null };
