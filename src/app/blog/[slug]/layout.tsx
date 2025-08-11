import dynamic from 'next/dynamic'

// dynamic import CSS only for blog pages to keep above-the-fold CSS small on other routes
const BlogCss = dynamic(async () => {
  await import('highlight.js/styles/github.css')
  await import('../blog-styles.css')
  return function CssStub() { return null }
}, { ssr: false })

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogCss />
      {children}
    </>
  )
}


