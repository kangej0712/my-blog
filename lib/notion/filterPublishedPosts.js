export default function filterPublishedPosts({ posts, includePages }) {
  if (!posts || !posts.length) return []

  return posts
    .filter(post =>
      includePages
        ? post?.type?.[0] === 'Post' || post?.type?.[0] === 'Page'
        : post?.type?.[0] === 'Post'
    )
    .filter(post =>
      post.title &&
      post.slug &&
      post.published === true &&  // 소문자 속성 기준으로 체크
      post.date <= new Date()
    )
}
