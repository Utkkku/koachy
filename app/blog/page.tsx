import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/src/components/page-shell';
import { blogPosts } from '@/src/data/blog-posts';
import { BRAND_NAME } from '@/src/config/brand';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDateTR } from '@/src/lib/format';

export const metadata: Metadata = {
  title: `Blog | ${BRAND_NAME}`,
  description: 'Sınav hazırlığı, motivasyon ve çalışma ipuçları.',
};

export default function BlogPage() {
  return (
    <PageShell>
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 mb-2">Blog</p>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">{BRAND_NAME} Blog</h1>
        <p className="text-lg font-medium text-gray-600 leading-relaxed">
          Sınav hazırlığı, verimli çalışma ve motivasyon üzerine kısa yazılar. Yeni içerikler düzenli olarak
          eklenecek.
        </p>
      </div>

      <ul className="space-y-8">
        {blogPosts.map((post) => (
          <li key={post.slug}>
            <article className="border-4 border-black rounded-xl bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateTR(post.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} okuma
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-black mb-3 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-base font-medium text-gray-600 leading-relaxed mb-5">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 font-black text-sm text-indigo-600 border-b-2 border-indigo-600 hover:text-indigo-800 hover:border-indigo-800 transition-colors"
              >
                Devamını oku
                <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
