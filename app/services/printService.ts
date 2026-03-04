interface PrintOptions {
  documentTitle?: string
}

const printService = {
  /**
   * 印刷前の準備処理。body に 'printing' クラスを付与し、
   * afterprint イベントで自動クリーンアップする。
   * @returns クリーンアップ関数（afterprint 前に手動解除する場合に使用）
   */
  preparePrint(): () => void {
    if (typeof window === 'undefined') return () => {}

    document.body.classList.add('printing')

    const cleanup = () => {
      document.body.classList.remove('printing')
    }

    window.addEventListener('afterprint', cleanup, { once: true })

    return cleanup
  },

  /**
   * ブラウザの印刷ダイアログを起動する。
   * Next.js SSR 環境では window チェックを必ず行う。
   */
  triggerPrint(options?: PrintOptions): void {
    if (typeof window === 'undefined') return

    const originalTitle = document.title

    if (options?.documentTitle) {
      document.title = options.documentTitle
      window.addEventListener(
        'afterprint',
        () => {
          document.title = originalTitle
        },
        { once: true }
      )
    }

    this.preparePrint()
    window.print()
  },
}

export default printService
