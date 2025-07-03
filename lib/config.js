// lib/config.js
import { createContext, useContext } from 'react'
import siteConfig from './site.config'

const ConfigContext = createContext(siteConfig)   // ⭐ 기본값 세팅

export function ConfigProvider({ value = {}, children }) {
  // 외부에서 넘긴 값이 있으면 siteConfig와 병합(override)
  const merged = { ...siteConfig, ...value }

  return (
    <ConfigContext.Provider value={merged}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
