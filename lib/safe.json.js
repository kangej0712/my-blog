// lib/safeJson.js
/**
 * undefined ➜ null 변환으로
 * Next.js 직렬화 오류를 막아주는 헬퍼
 */
export const safeJson = (data) =>
  JSON.parse(
    JSON.stringify(data, (_k, v) => (v === undefined ? null : v))
  )
