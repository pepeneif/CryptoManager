// Simple i18n system
type TranslationFunction = (key: string) => string

// Translations
const translations: Record<string, Record<string, string>> = {
  es: {
    'settings.title': 'Settings',
    'settings.config': 'Configuración',
    'settings.companyData': 'Datos de la Empresa',
    'settings.users': 'Administrar usuarios',
    'settings.groups': 'Administrar grupos',
    'settings.coins': 'Administrar monedas',
    'settings.references': 'Referencias',
    'settings.users.desc': 'Administrar usuarios del sistema',
    'settings.groups.desc': 'Administrar grupos de trabajo',
    'settings.coins.desc': 'Configurar criptomonedas y tokens',
    'settings.references.desc': 'Moneda base, idioma y fuente de precios',
  },
  en: {
    'settings.title': 'Settings',
    'settings.config': 'Configuration',
    'settings.companyData': 'Company Data',
    'settings.users': 'Manage Users',
    'settings.groups': 'Manage Groups',
    'settings.coins': 'Manage Coins',
    'settings.references': 'References',
    'settings.users.desc': 'Manage system users',
    'settings.groups.desc': 'Manage work groups',
    'settings.coins.desc': 'Configure cryptocurrencies and tokens',
    'settings.references.desc': 'Base currency, language and price source',
  },
  zh: {
    'settings.title': '设置',
    'settings.config': '配置',
    'settings.companyData': '公司数据',
    'settings.users': '用户管理',
    'settings.groups': '群组管理',
    'settings.coins': '货币管理',
    'settings.references': '参考',
    'settings.users.desc': '管理系统用户',
    'settings.groups.desc': '管理工作组',
    'settings.coins.desc': '配置加密货币和代币',
    'settings.references.desc': '基准货币、语言和价格来源',
  },
  ja: {
    'settings.title': '設定',
    'settings.config': '設定',
    'settings.companyData': '会社データ',
    'settings.users': 'ユーザー管理',
    'settings.groups': 'グループ管理',
    'settings.coins': 'コイン管理',
    'settings.references': '参照',
    'settings.users.desc': 'システムユーザーを管理',
    'settings.groups.desc': 'ワーキンググループを管理',
    'settings.coins.desc': '暗号通貨とトークンを設定',
    'settings.references.desc': '基準通貨、语言、价格源',
  },
  ko: {
    'settings.title': '설정',
    'settings.config': '구성',
    'settings.companyData': '회사 데이터',
    'settings.users': '사용자 관리',
    'settings.groups': '그룹 관리',
    'settings.coins': '코인 관리',
    'settings.references': '참조',
    'settings.users.desc': '시스템 사용자 관리',
    'settings.groups.desc': '작업 그룹 관리',
    'settings.coins.desc': '암호화폐 및 토큰 구성',
    'settings.references.desc': '기준 통화, 언어 및 가격 소스',
  },
}

let currentLanguage = 'es'
const subscribers: Set<() => void> = new Set()

export const t: TranslationFunction = (key: string): string => {
  return translations[currentLanguage]?.[key] || translations['en']?.[key] || key
}

export const getLanguage = () => currentLanguage

export const setLanguage = (lang: string) => {
  if (translations[lang]) {
    currentLanguage = lang
    subscribers.forEach(fn => fn())
  }
}

export const subscribeToLanguageChanges = (callback: () => void) => {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

export const loadLanguageFromConfig = async (token: string) => {
  try {
    const response = await fetch('/api/admin/system-config', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      if (data.system_language && translations[data.system_language]) {
        currentLanguage = data.system_language
      }
    }
  } catch (e) {
    console.error('Error loading language:', e)
  }
}

export const getAvailableLanguages = () => [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
]
