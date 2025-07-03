import { clientConfig } from '@/lib/server/config'

import Container from '@/components/Container'
import BlogPost from '@/components/BlogPost'
import Pagination from '@/components/Pagination'
import { getAllPosts } from '@/lib/notion'
import { useConfig } from '@/lib/config'

/** ----------------------------------------------------------------
 *  🛠 getStaticProps
 *  - rawPosts → JSON.parse(JSON.stringify()) 로 감싸서
 *    undefined 값을 모두 null 로 바꾼 뒤 넘겨줍니다.
 * ----------------------------------------------------------------*/
export async function getStaticProps() {
  const rawPosts = await getAllPosts({ includePages: false })

  // 🚨 undefined → null 로 변환 (Next.js 직렬화 오류 방지)
  const posts = JSON.parse(JSON.stringify(rawPosts))

  const postsToShow = posts.slice(0, clientConfig.postsPerPage)
  const totalPosts = posts.length
  const showNext = totalPosts > clientConfig.postsPerPage

  return {
    props: {
      page: 1,          // 현재 페이지 = 1
      postsToShow,      // 보여줄 글들
      showNext          // 다음 페이지 버튼 노출 여부
    },
    revalidate: 60      // 필요하면 1초로 다시 바꿔도 OK
  }
}

/** ----------------------------------------------------------------
 *  페이지 컴포넌트
 * ----------------------------------------------------------------*/
export default function Blog({ postsToShow, page, showNext }) {
  const { title, description } = useConfig()

  return (
    <Container title={title} description={description}>
      {postsToShow.map(post => (
        <BlogPost key={post.id} post={post} />
      ))}

      {showNext && <Pagination page={page} showNext={showNext} />}
    </Container>
  )
}
