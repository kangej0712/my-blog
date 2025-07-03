/**
 * JSON.stringify 과정에서 undefined 값을 null 로 치환해
 * Next.js(SSG/ISR) 직렬화 오류를 방지하는 유틸.
 *
 *  - 사용 : const clean = safeJson(data)
 */
function safeJson(data) {
  return JSON.parse(
    JSON.stringify(data, (_key, value) =>
      value === undefined ? null : value
    )
  );
}

module.exports = { safeJson };
