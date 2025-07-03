// pages/search.js
import { getAllPosts, getAllTagsFromPosts } from '@/lib/notion'
import SearchLayout from '@/layouts/search'
import { safeJson } from '@/lib/safeJson'

export default function SearchPage({ tags, posts }) {
  return <SearchLayout tags={tags} posts={posts} />
}

export async function getStaticProps() {
  const rawPosts = await getAllPosts({ includePages: false })
  const posts = safeJson(rawPosts)
  const tags = getAllTagsFromPosts(posts)

  return {
    props: { tags, posts },
    revalidate: 60
  }
}
