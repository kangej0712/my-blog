// lib/safeJson.ts
/**
 * Next.js → JSON 직렬화 시 `undefined` 값 때문에
 * “cannot be serialized” 에러가 나는 것을 막아주는 헬퍼
 */
export const safeJson = <T,>(data: T): T =>
  JSON.parse(
    JSON.stringify(data, (_k, v) => (v === undefined ? null : v))
  ) as T

// lib/safeJson.js
/**
 * undefined → null 로 바꿔서
 * Next.js 직렬화 오류를 막아주는 작은 헬퍼
 */
export const safeJson = (data) =>
  JSON.parse(
    JSON.stringify(data, (_k, v) => (v === undefined ? null : v))
  )
