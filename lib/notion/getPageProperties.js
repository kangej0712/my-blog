import { getTextContent, getDateValue } from 'notion-utils'
import api from '@/lib/server/notion-api'

async function getPageProperties(id, block, schema) {
  const rawProperties = Object.entries(block?.[id]?.value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = {}

  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id

    const type = schema[key]?.type
    const name = schema[key]?.name?.toLowerCase() // ✅ 컬럼명 소문자로 통일

    if (type && !excludeProperties.includes(type)) {
      if (type === 'checkbox') {
        const checkboxValue = val?.[0]?.[0] === 'Yes'
        properties[name] = checkboxValue
      } else {
        properties[name] = getTextContent(val)
      }
    } else {
      switch (type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[name] = dateProperty
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[name] = selects.split(',')
          }
          break
        }
        case 'person': {
          const rawUsers = val.flat()
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await api.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          properties[name] = users
          break
        }
        default:
          break
      }
    }
  }

  console.log('[DEBUG] properties for ID:', id, properties)
  console.log('🔍 가져온 페이지 속성:', properties)
  return properties
}

export { getPageProperties as default }
