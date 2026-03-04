import ManuscriptEditor from '@/app/components/ManuscriptEditor'
import DolphinIndicator from '@/app/components/DolphinIndicator'
import CharacterCounter from '@/app/components/CharacterCounter'

export default function WritePage() {
  return (
    <main className="write-page">
      <div className="editor-container">
        <header className="controls-header">
          <DolphinIndicator />
          <CharacterCounter />
        </header>
        <ManuscriptEditor />
      </div>
    </main>
  )
}
