import { handleSpotifySearch } from '../server/spotify-search.js'

export default function handler(req, res) {
  return handleSpotifySearch(req, res, process.env)
}
