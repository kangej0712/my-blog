import { clientConfig } from '@/lib/server/config';

import { useRouter } from 'next/router';
import cn from 'classnames';
import { getAllPosts, getPostBlocks } from '@/lib/notion';
import { useLocale } from '@/lib/locale';
import { useConfig } from '@/lib/config';
import { createHash } from 'crypto';
import Container from '@/components/Container';
import Post from '@/components/Post';
import { safeJson } from '@/lib/safeJson';      // ✅ 직렬화 안전 유틸

/* ────────────────────────────────────
 *  화면 컴포넌트
 * ────────────────────────────────── */
export default function BlogPost({ post, blockMap, emailHash }) {
  const router = useRouter();
  const BLOG = useConfig();
  const locale = useLocale();

  // Fallback 중이면 비워두기
  if (router.isFallback) return null;

  const fullWidth = post.fullWidth ?? false;

  return (
    <Container
      layout="blog"
      title={post.title}
      description={post.summary}
      slug={post.slug}
      type="article"
      fullWidth={fullWidth}
    >
      <Post
        post={post}
        blockMap={blockMap}
        emailHash={emailHash}
        fullWidth={fullWidth}
      />

      {/* Back & Top 버튼 */}
      <div
        className={cn(
          'px-4 flex justify-between font-medium text-gray-500 dark:text-gray-400 my-5',
          fullWidth ? 'md:px-24' : 'mx-auto max-w-2xl'
        )}
      >
        <button
          onClick={() => router.push(BLOG.path || '/')}
          className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
        >
          ← {locale.POST.BACK}
        </button>

        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }
          className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
        >
          ↑ {locale.POST.TOP}
        </button>
      </div>

      {/* ❌ 댓글 컴포넌트 제거 */}
    </Container>
  );
}

/* ────────────────────────────────────
 *  SSG: 동적 경로 생성
 * ────────────────────────────────── */
export async function getStaticPaths() {
  const posts = await getAllPosts({ includePages: true });

  return {
    paths: posts.map((row) => `${clientConfig.path}/${row.slug}`),
    fallback: true
  };
}

/* ────────────────────────────────────
 *  SSG + ISR
 * ────────────────────────────────── */
export async function getStaticProps({ params }) {
  const { slug } = params;
  const posts = await getAllPosts({ includePages: true });
  const rawPost = posts.find((p) => p.slug === slug);

  if (!rawPost) {
    return { notFound: true };
  }

  const blockMapRaw = await getPostBlocks(rawPost.id);

  const emailHash = createHash('md5')
    .update(clientConfig.email)
    .digest('hex')
    .trim()
    .toLowerCase();

  /* 🚑  undefined → null  치환 */
  const post = safeJson(rawPost);
  const blockMap = safeJson(blockMapRaw);

  return {
    props: { post, blockMap, emailHash },
    revalidate: 60               // 필요하면 조정
  };
}
