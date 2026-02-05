export interface TeamsConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  teamId?: string
  channelId?: string
}

export interface GraphMessage {
  id: string
  body: { content: string }
  from?: { user?: { displayName?: string } }
  createdDateTime: string
  webUrl: string
}
