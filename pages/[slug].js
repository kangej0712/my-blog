import { clientConfig } from '@/lib/server/config'

import { useRouter } from 'next/router'
import cn from 'classnames'
import { getAllPosts, getPostBlocks } from '@/lib/notion'
import { useLocale } from '@/lib/locale'
import { useConfig } from '@/lib/config'
import { createHash } from 'crypto'
import Container from '@/components/Container'
import Post from '@/components/Post'
// ❌ 댓글 기능 제거 – import / 컴포넌트 모두 삭제

/** ------------------------------------------------------------------
 *  🚚 runtime-safe JSON 
 *  - Next.js 직렬화 과정에서 `undefined` 가 있으면 빌드 실패
 *  - JSON.parse(JSON.stringify(obj)) :  undefined→null 로 변환
 * ------------------------------------------------------------------*/
const safeJson = <T,>(data: T): T =>
  JSON.parse(JSON.stringify(data))

/* -------------------------------------------------------------------
 *  🔖  페이지 컴포넌트
 * ------------------------------------------------------------------*/
export default function BlogPost({
  post,
  blockMap,
  emailHash
}) {
  const router = useRouter()
  const BLOG = useConfig()
  const locale = useLocale()

  // Fallback 상태일 때 아무것도 렌더링하지 않음
  if (router.isFallback) return null

  const fullWidth = post.fullWidth ?? false

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

      {/* Back / Top 버튼 */}
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
            window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
        >
          ↑ {locale.POST.TOP}
        </button>
      </div>
    </Container>
  )
}

/* -------------------------------------------------------------------
 *  🔗 정적 경로 생성
 * ------------------------------------------------------------------*/
export async function getStaticPaths() {
  const posts = await getAllPosts({ includePages: true })

  return {
    paths: posts.map(p => `${clientConfig.path}/${p.slug}`),
    fallback: true                    // ISR
  }
}

/* -------------------------------------------------------------------
 *  🛠 데이터 패칭 & 직렬화 안전 처리
 * ------------------------------------------------------------------*/
export async function getStaticProps({ params: { slug } }) {
  // 모든 글 목록
  const posts = await getAllPosts({ includePages: true })
  const post = posts.find(p => p.slug === slug)

  if (!post) return { notFound: true }

  // 블록 내용
  const blockMap = await getPostBlocks(post.id)

  // Gravatar용 e-mail MD5
  const emailHash = createHash('md5')
    .update(clientConfig.email || '')
    .digest('hex')
    .trim()
    .toLowerCase()

  /* 🚨 핵심: undefined 제거
     safeJson(post) / safeJson(blockMap) */
  return {
    props: {
      post: safeJson(post),
      blockMap: safeJson(blockMap),
      emailHash
    },
    revalidate: 60           // 필요 시 조절
  }
}
