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

export type Data = {
  __typename?: 'Data';
  about_the_game?: Maybe<Scalars['String']>;
  background?: Maybe<Scalars['String']>;
  detailed_description?: Maybe<Scalars['String']>;
  header_image?: Maybe<Scalars['String']>;
  is_free?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  platforms?: Maybe<Plataforms>;
  required_age?: Maybe<Scalars['Int']>;
  screenshots?: Maybe<Array<ScreenShot>>;
  short_description?: Maybe<Scalars['String']>;
  steam_appid?: Maybe<Scalars['Int']>;
  supported_languages?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  website?: Maybe<Scalars['String']>;
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

export type GameDetails = {
  __typename?: 'GameDetails';
  data?: Maybe<Data>;
  success: Scalars['Boolean'];
};

export type GamedigServerInfo = {
  __typename?: 'GamedigServerInfo';
  connect: Scalars['String'];
  gameDetails?: Maybe<GameDetails>;
  map: Scalars['String'];
  maxplayers: Scalars['Float'];
  message: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['Boolean'];
  ping: Scalars['Float'];
  players: Array<Player>;
  raw: RawInfo;
  workshop?: Maybe<Workshop>;
};

export type MultipleServerResponse = {
  __typename?: 'MultipleServerResponse';
  errors?: Maybe<Array<ErrorOutput>>;
  response?: Maybe<Array<ServerResponse>>;
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

export type Plataforms = {
  __typename?: 'Plataforms';
  linux: Scalars['Boolean'];
  mac: Scalars['Boolean'];
  windows: Scalars['Boolean'];
};

export type Player = {
  __typename?: 'Player';
  name: Scalars['String'];
  raw: Score;
};

export type Query = {
  __typename?: 'Query';
  getMultiplesServerInfo?: Maybe<MultipleServerResponse>;
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
  workshop_map_id?: Maybe<Scalars['Int']>;
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

export type ScreenShot = {
  __typename?: 'ScreenShot';
  id: Scalars['Int'];
  path_full: Scalars['String'];
  path_thumbnail: Scalars['String'];
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

export type Tag = {
  __typename?: 'Tag';
  tag?: Maybe<Scalars['String']>;
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

export type Workshop = {
  __typename?: 'Workshop';
  ban_reason?: Maybe<Scalars['String']>;
  banned?: Maybe<Scalars['Int']>;
  consumer_app_id?: Maybe<Scalars['Int']>;
  creator?: Maybe<Scalars['String']>;
  creator_app_id?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  favorited?: Maybe<Scalars['Int']>;
  file_size?: Maybe<Scalars['Int']>;
  file_url?: Maybe<Scalars['String']>;
  filename?: Maybe<Scalars['String']>;
  hcontent_file?: Maybe<Scalars['String']>;
  hcontent_preview?: Maybe<Scalars['String']>;
  lifetime_favorited?: Maybe<Scalars['Int']>;
  lifetime_subscriptions?: Maybe<Scalars['Int']>;
  preview_url?: Maybe<Scalars['String']>;
  publishedfileid?: Maybe<Scalars['String']>;
  result?: Maybe<Scalars['Int']>;
  subscriptions?: Maybe<Scalars['Int']>;
  time_created?: Maybe<Scalars['Int']>;
  time_updated?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
  version?: Maybe<Array<Tag>>;
  views?: Maybe<Scalars['Int']>;
  visibility?: Maybe<Scalars['Int']>;
};

export type RegularUserFragment = { __typename?: 'User', id: number, username: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, username: string } | null };

export type GetMultiplesServerInfoQueryVariables = Exact<{
  apikey: Scalars['String'];
  servers: Array<ServerInput> | ServerInput;
}>;


export type GetMultiplesServerInfoQuery = { __typename?: 'Query', getMultiplesServerInfo?: { __typename?: 'MultipleServerResponse', response?: Array<{ __typename?: 'ServerResponse', response?: { __typename?: 'GamedigServerInfo', name: string, map: string, maxplayers: number, connect: string, raw: { __typename?: 'RawInfo', numplayers?: number | null, game?: string | null } } | null, errors?: Array<{ __typename?: 'ErrorOutput', errorType?: string | null, message?: string | null }> | null }> | null, errors?: Array<{ __typename?: 'ErrorOutput', errorType?: string | null, message?: string | null }> | null } | null };

export type GetServerInfoQueryVariables = Exact<{
  apikey: Scalars['String'];
  host: Scalars['String'];
  port: Scalars['Int'];
  type: Scalars['String'];
}>;


export type GetServerInfoQuery = { __typename?: 'Query', getServerInfo?: { __typename?: 'ServerResponse', response?: { __typename?: 'GamedigServerInfo', name: string, map: string, maxplayers: number, password: boolean, connect: string, ping: number, raw: { __typename?: 'RawInfo', numplayers?: number | null, protocol?: number | null, folder?: string | null, game?: string | null, appId?: number | null, numbots?: number | null, secure?: number | null, version?: string | null, tags?: Array<string> | null }, workshop?: { __typename?: 'Workshop', preview_url?: string | null } | null, gameDetails?: { __typename?: 'GameDetails', success: boolean, data?: { __typename?: 'Data', header_image?: string | null } | null } | null, players: Array<{ __typename?: 'Player', name: string, raw: { __typename?: 'Score', score?: string | null, time?: string | null } }> } | null, errors?: Array<{ __typename?: 'ErrorOutput', errorType?: string | null, message?: string | null }> | null } | null };
