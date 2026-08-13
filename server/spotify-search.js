function buildStableAudioUrl(track) {
  return track.preview || '/audio/preview-loop.wav'
}

export async function searchSpotifyTracks(query, env = process.env) {
  const trimmedQuery = query?.trim()
  if (!trimmedQuery) {
    return []
  }

  const searchResponse = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(trimmedQuery)}&limit=8`)

  if (!searchResponse.ok) {
    const errorText = await searchResponse.text()
    throw new Error(`Music search failed: ${errorText || searchResponse.statusText}`)
  }

  const searchPayload = await searchResponse.json()
  const tracks = Array.isArray(searchPayload?.data) ? searchPayload.data : []

  return tracks.map((track) => {
    const stableStream = buildStableAudioUrl(track)

    return {
      id: String(track.id),
      title: track.title || 'Untitled track',
      artist: track.artist?.name || 'Unknown artist',
      spotifyUrl: stableStream,
      previewUrl: stableStream,
      artwork: track.album?.cover_medium || track.album?.cover_big || '',
    }
  })
}

export async function handleSpotifySearch(req, res, env = process.env) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.end()
    return
  }

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const url = new URL(req.url || '/', 'http://localhost')
  const query = url.searchParams.get('q') || ''

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (!query.trim()) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Missing query parameter: q' }))
    return
  }

  try {
    const tracks = await searchSpotifyTracks(query, env)
    res.statusCode = 200
    res.end(JSON.stringify({ tracks }))
  } catch (error) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to search music right now.' }))
  }
}
