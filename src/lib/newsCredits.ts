export interface NewsCredits {
  author?: string
  photographer?: string
  source?: string
}

const AUTHOR_RE = /^\[WRITTEN BY: (.+)\]$/
const PHOTO_RE = /^\[SHOT BY: (.+)\]$/
const SOURCE_RE = /^\[SOURCE: (.+)\]$/

export function creditsToContent(credits: NewsCredits, body: string): string {
  const lines: string[] = []
  if (credits.author) lines.push(`[WRITTEN BY: ${credits.author}]`)
  if (credits.photographer) lines.push(`[SHOT BY: ${credits.photographer}]`)
  if (credits.source) lines.push(`[SOURCE: ${credits.source}]`)
  if (lines.length === 0) return body
  return [...lines, '', body].join('\n')
}

export function parseCredits(content: string): { credits: NewsCredits; body: string } {
  const lines = content.split('\n')
  const credits: NewsCredits = {}
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    const author = line.match(AUTHOR_RE)
    const photographer = line.match(PHOTO_RE)
    const source = line.match(SOURCE_RE)
    if (author) credits.author = author[1]
    else if (photographer) credits.photographer = photographer[1]
    else if (source) credits.source = source[1]
    else break
    i++
  }
  return { credits, body: lines.slice(i).join('\n').trim() }
}