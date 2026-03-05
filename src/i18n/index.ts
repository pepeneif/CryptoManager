// Simple i18n system
type TranslationFunction = (key: string) => string

// Translations
const translations: Record<string, Record<string, string>> = {
  es: {
    // Menu
    'menu.wallets': 'Wallets',
    'menu.clientes': 'Clientes',
    'menu.proveedores': 'Proveedores',
    'menu.facturas': 'Facturas',
    'menu.pagos': 'Pagos',
    'menu.tasks': 'Tasks',
    'menu.reportes': 'Reportes',
    'menu.configuracion': 'Configuración',
    'menu.preferencias': 'Preferencias',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.config': 'Configuración',
    'settings.companyData': 'Datos de la Empresa',
    'settings.users': 'Administrar usuarios',
    'settings.groups': 'Administrar grupos',
    'settings.coins': 'Administrar monedas',
    'settings.preferencias': 'Preferencias',
    'settings.users.desc': 'Administrar usuarios del sistema',
    'settings.groups.desc': 'Administrar grupos de trabajo',
    'settings.coins.desc': 'Configurar criptomonedas y tokens',
    'settings.preferencias.desc': 'Moneda base, idioma y fuente de precios',
    
    // Common
    'common.crear': 'Crear',
    'common.guardar': 'Guardar',
    'common.cancelar': 'Cancelar',
    'common.eliminar': 'Eliminar',
    'common.buscar': 'Buscar',
    'common.editar': 'Editar',
    'common.aceptar': 'Aceptar',
    'common.si': 'Sí',
    'common.no': 'No',
    'common.cargando': 'Cargando...',
    'common.guardando': 'Guardando...',
    'common.validando': 'Validando...',
    'common.noData': 'No hay datos',
    'common.seleccionar': 'Seleccionar',
    
    // Confirmations
    'confirm.delete': '¿Eliminar?',
    'confirm.deleteUser': '¿Eliminar usuario?',
    'confirm.deleteGroup': '¿Eliminar grupo?',
    'confirm.deleteCoin': '¿Eliminar esta moneda?',
    'confirm.deleteInvoice': '¿Eliminar factura?',
    'confirm.deleteClient': '¿Eliminar cliente?',
    'confirm.deleteProvider': '¿Eliminar proveedor?',
    'confirm.deleteMovement': '¿Eliminar movimiento? Esto revertirá el balance.',
    
    // Labels
    'label.nombre': 'Nombre',
    'label.email': 'Email',
    'label.telefono': 'Teléfono',
    'label.direccion': 'Dirección',
    'label.balance': 'Balance',
    'label.total': 'Total',
    'label.fecha': 'Fecha',
    'label.moneda': 'Moneda',
    'label.descripcion': 'Descripción',
    'label.cantidad': 'Cantidad',
    'label.precioUnitario': 'Precio Unit.',
    'label.datosFiscales': 'Datos Fiscales',
    
    // Placeholders
    'placeholder.buscar': 'Buscar...',
  },
  en: {
    // Menu
    'menu.wallets': 'Wallets',
    'menu.clientes': 'Clients',
    'menu.proveedores': 'Suppliers',
    'menu.facturas': 'Invoices',
    'menu.pagos': 'Payments',
    'menu.tasks': 'Tasks',
    'menu.reportes': 'Reports',
    'menu.configuracion': 'Settings',
    'menu.preferencias': 'Preferences',
    
    // Settings
    'settings.title': 'Settings',
    'settings.config': 'Configuration',
    'settings.companyData': 'Company Data',
    'settings.users': 'Manage Users',
    'settings.groups': 'Manage Groups',
    'settings.coins': 'Manage Coins',
    'settings.preferencias': 'Preferences',
    'settings.users.desc': 'Manage system users',
    'settings.groups.desc': 'Manage work groups',
    'settings.coins.desc': 'Configure cryptocurrencies and tokens',
    'settings.preferencias.desc': 'Base currency, language and price source',
    
    // Common
    'common.crear': 'Create',
    'common.guardar': 'Save',
    'common.cancelar': 'Cancel',
    'common.eliminar': 'Delete',
    'common.buscar': 'Search',
    'common.editar': 'Edit',
    'common.aceptar': 'Accept',
    'common.si': 'Yes',
    'common.no': 'No',
    'common.cargando': 'Loading...',
    'common.guardando': 'Saving...',
    'common.validando': 'Validating...',
    'common.noData': 'No data',
    'common.seleccionar': 'Select',
    
    // Confirmations
    'confirm.delete': 'Delete?',
    'confirm.deleteUser': 'Delete user?',
    'confirm.deleteGroup': 'Delete group?',
    'confirm.deleteCoin': 'Delete this coin?',
    'confirm.deleteInvoice': 'Delete invoice?',
    'confirm.deleteClient': 'Delete client?',
    'confirm.deleteProvider': 'Delete supplier?',
    'confirm.deleteMovement': 'Delete movement? This will revert the balance.',
    
    // Labels
    'label.nombre': 'Name',
    'label.email': 'Email',
    'label.telefono': 'Phone',
    'label.direccion': 'Address',
    'label.balance': 'Balance',
    'label.total': 'Total',
    'label.fecha': 'Date',
    'label.moneda': 'Currency',
    'label.descripcion': 'Description',
    'label.cantidad': 'Quantity',
    'label.precioUnitario': 'Unit Price',
    'label.datosFiscales': 'Tax Data',
    
    // Placeholders
    'placeholder.buscar': 'Search...',
  },
  zh: {
    // Menu
    'menu.wallets': '钱包',
    'menu.clientes': '客户',
    'menu.proveedores': '供应商',
    'menu.facturas': '发票',
    'menu.pagos': '付款',
    'menu.tasks': '任务',
    'menu.reportes': '报告',
    'menu.configuracion': '设置',
    'menu.preferencias': '偏好设置',
    
    // Settings
    'settings.title': '设置',
    'settings.config': '配置',
    'settings.companyData': '公司数据',
    'settings.users': '用户管理',
    'settings.groups': '群组管理',
    'settings.coins': '货币管理',
    'settings.preferencias': '偏好设置',
    'settings.users.desc': '管理系统用户',
    'settings.groups.desc': '管理工作组',
    'settings.coins.desc': '配置加密货币和代币',
    'settings.preferencias.desc': '基准货币、语言和价格来源',
    
    // Common
    'common.crear': '创建',
    'common.guardar': '保存',
    'common.cancelar': '取消',
    'common.eliminar': '删除',
    'common.buscar': '搜索',
    'common.editar': '编辑',
    'common.aceptar': '接受',
    'common.si': '是',
    'common.no': '否',
    'common.cargando': '加载中...',
    'common.guardando': '保存中...',
    'common.validando': '验证中...',
    'common.noData': '无数据',
    'common.seleccionar': '选择',
    
    // Confirmations
    'confirm.delete': '删除？',
    'confirm.deleteUser': '删除用户？',
    'confirm.deleteGroup': '删除群组？',
    'confirm.deleteCoin': '删除此货币？',
    'confirm.deleteInvoice': '删除发票？',
    'confirm.deleteClient': '删除客户？',
    'confirm.deleteProvider': '删除供应商？',
    'confirm.deleteMovement': '删除移动？这将恢复余额。',
    
    // Labels
    'label.nombre': '名称',
    'label.email': '邮箱',
    'label.telefono': '电话',
    'label.direccion': '地址',
    'label.balance': '余额',
    'label.total': '总计',
    'label.fecha': '日期',
    'label.moneda': '货币',
    'label.descripcion': '描述',
    'label.cantidad': '数量',
    'label.precioUnitario': '单价',
    'label.datosFiscales': '税务数据',
    
    // Placeholders
    'placeholder.buscar': '搜索...',
  },
  ja: {
    // Menu
    'menu.wallets': 'ウォレット',
    'menu.clientes': 'クライアント',
    'menu.proveedores': 'サプライヤー',
    'menu.facturas': '請求書',
    'menu.pagos': '支払い',
    'menu.tasks': 'タスク',
    'menu.reportes': 'レポート',
    'menu.configuracion': '設定',
    'menu.preferencias': '環境設定',
    
    // Settings
    'settings.title': '設定',
    'settings.config': '設定',
    'settings.companyData': '会社データ',
    'settings.users': 'ユーザー管理',
    'settings.groups': 'グループ管理',
    'settings.coins': 'コイン管理',
    'settings.preferencias': '環境設定',
    'settings.users.desc': 'システムユーザーを管理',
    'settings.groups.desc': 'ワーキンググループを管理',
    'settings.coins.desc': '暗号通貨とトークンを設定',
    'settings.preferencias.desc': '基準通貨、语言、価格源',
    
    // Common
    'common.crear': '作成',
    'common.guardar': '保存',
    'common.cancelar': 'キャンセル',
    'common.eliminar': '削除',
    'common.buscar': '検索',
    'common.editar': '編集',
    'common.aceptar': '承認',
    'common.si': 'はい',
    'common.no': 'いいえ',
    'common.cargando': '読み込み中...',
    'common.guardando': '保存中...',
    'common.validando': '検証中...',
    'common.noData': 'データなし',
    'common.seleccionar': '選択',
    
    // Confirmations
    'confirm.delete': '削除？',
    'confirm.deleteUser': 'ユーザーを削除？',
    'confirm.deleteGroup': 'グループを削除？',
    'confirm.deleteCoin': 'このコインを削除？',
    'confirm.deleteInvoice': '請求書を削除？',
    'confirm.deleteClient': 'クライアントを削除？',
    'confirm.deleteProvider': 'サプライヤーを削除？',
    'confirm.deleteMovement': '動きを削除？残高が戻ります。',
    
    // Labels
    'label.nombre': '名前',
    'label.email': 'メール',
    'label.telefono': '電話',
    'label.direccion': '住所',
    'label.balance': '残高',
    'label.total': '合計',
    'label.fecha': '日付',
    'label.moneda': '通貨',
    'label.descripcion': '説明',
    'label.cantidad': '数量',
    'label.precioUnitario': '単価',
    'label.datosFiscales': '税務データ',
    
    // Placeholders
    'placeholder.buscar': '検索...',
  },
  ko: {
    // Menu
    'menu.wallets': '월렛',
    'menu.clientes': '고객',
    'menu.proveedores': '공급업체',
    'menu.facturas': '청구서',
    'menu.pagos': '결제',
    'menu.tasks': '작업',
    'menu.reportes': '보고서',
    'menu.configuracion': '설정',
    'menu.preferencias': '환경 설정',
    
    // Settings
    'settings.title': '설정',
    'settings.config': '구성',
    'settings.companyData': '회사 데이터',
    'settings.users': '사용자 관리',
    'settings.groups': '그룹 관리',
    'settings.coins': '코인 관리',
    'settings.preferencias': '환경 설정',
    'settings.users.desc': '시스템 사용자 관리',
    'settings.groups.desc': '작업 그룹 관리',
    'settings.coins.desc': '암호화폐 및 토큰 구성',
    'settings.preferencias.desc': '기준 통화, 언어 및 가격 소스',
    
    // Common
    'common.crear': '생성',
    'common.guardar': '저장',
    'common.cancelar': '취소',
    'common.eliminar': '삭제',
    'common.buscar': '검색',
    'common.편집': '편집',
    'common.aceptar': '수락',
    'common.si': '예',
    'common.no': '아니오',
    'common.cargando': '로딩 중...',
    'common.guardando': '저장 중...',
    'common.validando': '유효성 검사 중...',
    'common.noData': '데이터 없음',
    'common.seleccionar': '선택',
    
    // Confirmations
    'confirm.delete': '삭제?',
    'confirm.deleteUser': '사용자를 삭제?',
    'confirm.deleteGroup': '그룹을 삭제?',
    'confirm.deleteCoin': '이 코인을 삭제?',
    'confirm.deleteInvoice': '청구서를 삭제?',
    'confirm.deleteClient': '고객을 삭제?',
    'confirm.deleteProvider': '공급업체를 삭제?',
    'confirm.deleteMovement': '이동을 삭제? 잔액이 복구됩니다.',
    
    // Labels
    'label.nombre': '이름',
    'label.email': '이메일',
    'label.telefono': '전화',
    'label.direccion': '주소',
    'label.balance': '잔액',
    'label.total': '합계',
    'label.fecha': '날짜',
    'label.moneda': '통화',
    'label.descripcion': '설명',
    'label.cantidad': '수량',
    'label.precioUnitario': '단가',
    'label.datosFiscals': '세무 데이터',
    
    // Placeholders
    'placeholder.buscar': '검색...',
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
