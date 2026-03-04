'use client'

import ManuscriptEditor from '@/app/components/ManuscriptEditor'
import DolphinIndicator from '@/app/components/DolphinIndicator'

export default function WritePage() {
  return (
    <main className="write-page">
      <DolphinIndicator />
      <ManuscriptEditor />
    </main>
  )
}
