const STORAGE_KEY = 'manuscript-data'

const storageService = {
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false
    try {
      const key = '__storage_test__'
      localStorage.setItem(key, key)
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  save(data: unknown): void {
    if (!this.isAvailable()) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // プライベートブラウジング・容量超過時はサイレントにスキップ
    }
  },

  load(): unknown | null {
    if (!this.isAvailable()) return null
    try {
      const item = localStorage.getItem(STORAGE_KEY)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  clear(): void {
    if (!this.isAvailable()) return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // サイレントにスキップ
    }
  },
}

export default storageService
