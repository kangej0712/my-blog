// pages/search.tsx   (또는 pages/search.jsx)

import { getAllPosts, getAllTagsFromPosts } from '@/lib/notion'
import SearchLayout from '@/layouts/search'

/* ──────────────────────────────────────
 *  화면 컴포넌트
 * ──────────────────────────────────── */
export default function SearchPage({ tags, posts }) {
  return <SearchLayout tags={tags} posts={posts} />
}

/* ──────────────────────────────────────
 *  SSG: 빌드·재생성 시 실행
 * ──────────────────────────────────── */
export async function getStaticProps() {
  // ① 글 모두 가져오기
  const rawPosts = await getAllPosts({ includePages: false })

  // ② 🚑 undefined → null 로 변환 (JSON 직렬화용 한 줄 트릭)
  const posts = JSON.parse(
    JSON.stringify(rawPosts, (_key, value) => (value === undefined ? null : value))
  )

  // ③ 태그 모으기
  const tags = getAllTagsFromPosts(posts)

  // ④ 페이지에 넘기기
  return {
    props: {
      tags,
      posts
    },
    // 1초마다(ISR) 새로 빌드하고 싶을 때. 원래 값 유지해도 무방
    revalidate: 1
  }
}
