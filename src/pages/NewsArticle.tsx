import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Newspaper } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Badge, EmptyState } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { newsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import { parseCredits } from '@/lib/newsCredits'
import { siteConfig } from '@/config/site'

export default function NewsArticle() {
  const { id } = useParams()
  const [news] = useLiveData(newsDb.list)
  const article = news?.find((n) => n.id === id)

  if (!article) {
    return (
      <div>
        <PageHero title="News" />
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <EmptyState icon={<Newspaper className="h-10 w-10" />} title="Article not found" subtitle="It may have been moved or removed." />
          <div className="mt-4 text-center">
            <Link to="/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to News
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { credits, body } = parseCredits(article.content)
  const paragraphs = body
    .split(/\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div>
      <PageHero title="News" />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 transition-colors hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to News
        </Link>

        <article className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="navy">{article.category}</Badge>
            <span className="flex items-center gap-1 text-xs font-medium text-ink-600">
              <Clock className="h-3.5 w-3.5" /> {formatDate(article.date)}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 border-y border-navy-900/10 py-3">
            <p className="text-sm leading-relaxed text-ink-600">
              {credits.author ? (
                <>
                  <span className="font-semibold text-ink-900">By {credits.author}</span>
                  <span className="mx-1.5 text-ink-400">&middot;</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-ink-900">By {siteConfig.orgName}</span>
                  <span className="mx-1.5 text-ink-400">&middot;</span>
                </>
              )}
              {siteConfig.schoolName}
              {credits.source && (
                <>
                  <span className="mx-1.5 text-ink-400">&middot;</span>
                  <span className="text-ink-400">Source: </span>
                  <span className="font-semibold text-ink-900">{credits.source}</span>
                </>
              )}
            </p>
          </div>

          {article.imageUrl && (
            <figure className="mt-6">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-64 w-full rounded-2xl object-cover sm:h-80"
              />
              {credits.photographer && (
                <figcaption className="mt-2 text-right text-xs text-ink-400">
                  PHOTO BY {credits.photographer.toUpperCase()}
                </figcaption>
              )}
            </figure>
          )}

          <div className="mt-8 space-y-5 border-t border-navy-900/10 pt-8">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-ink-900 sm:text-base">
                {para}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}