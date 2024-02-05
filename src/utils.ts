export interface Member {
  login: string;
  id: number;
  node_id: string;
  avatar_url: URL;
  gravatar_id: string;
  url: URL;
  html_url: URL;
  followers_url: URL;
  following_url: URL;
  gists_url: URL;
  starred_url: URL;
  subscriptions_url: URL;
  organizations_url: URL;
  repos_url: URL;
  events_url: URL;
  received_events_url: URL;
  type: string;
  site_admin: boolean;
}
