import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/src/components/page-shell';
import { blogPosts, getPostBySlug } from '@/src/data/blog-posts';
import { BRAND_NAME } from '@/src/config/brand';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { formatDateTR } from '@/src/lib/format';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: `Yazı bulunamadı | ${BRAND_NAME}` };
  return {
    title: `${post.title} | ${BRAND_NAME} Blog`,
    description: post.excerpt,
  };
}

function renderContent(text: string) {
  const lines = text.split('\n').filter(Boolean);
  return lines.map((line, i) => {
    const boldParts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} className="text-base font-medium text-gray-800 leading-relaxed mb-4 last:mb-0">
        {boldParts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="font-black text-black">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const dateLabel = formatDateTR(post.date);

  return (
    <PageShell>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 mb-10 font-black text-sm text-gray-600 hover:text-black border-b-2 border-transparent hover:border-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tüm yazılar
      </Link>

      <article>
        <header className="mb-8 pb-8 border-b-4 border-black">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} okuma
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg font-medium text-gray-600 leading-relaxed">{post.excerpt}</p>
        </header>

        <div className="prose prose-neutral max-w-none">{renderContent(post.content)}</div>
      </article>

      <div className="mt-14 pt-8 border-t-2 border-gray-200">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-300 text-black font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Bloga dön
        </Link>
      </div>
    </PageShell>
  );
}
