import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '作文苦手でも作文がスルスル書ける',
  description: 'オンライン原稿用紙エディタ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
