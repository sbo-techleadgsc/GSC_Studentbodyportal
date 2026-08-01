export declare function searchSpotifyTracks(query: string, env?: Record<string, string | undefined>): Promise<Array<{
  id: string
  title: string
  artist: string
  spotifyUrl: string
  artwork: string
}>>

export declare function handleSpotifySearch(req: any, res: any, env?: Record<string, string | undefined>): Promise<void> | void
