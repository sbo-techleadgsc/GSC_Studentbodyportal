import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Newspaper } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { Badge, EmptyState } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { newsDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
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

  const paragraphs = article.content
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

          <p className="mt-3 text-sm text-ink-600">
            By <span className="font-semibold text-ink-900">{siteConfig.orgName}</span> &middot; {siteConfig.schoolName}
          </p>

          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="mt-8 h-64 w-full rounded-2xl object-cover sm:h-80"
            />
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