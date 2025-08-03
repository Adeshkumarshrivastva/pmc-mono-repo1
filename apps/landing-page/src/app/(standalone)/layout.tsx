import '@/app/styles.css'

export default function StandaloneLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-primary">
          <div className="mx-auto max-w-screen-2xl p-4">
            <div className="flex flex-col items-center justify-center">{children}</div>
          </div>
        </main>
      </body>
    </html>
  )
}
