import Link from 'next/link'

export const metadata = {
  title: 'MindsAI - Screening Tests',
}

const SCREENING_TESTS = [
  { title: 'Anxiety', href: 'https://forestgreen-scorpion-490773.hostingersite.com/anxiety-screening/' },
  { title: 'Depression', href: 'https://forestgreen-scorpion-490773.hostingersite.com/depression-screening/' },
]

export default function MindsAIPage() {
  return (
    <section className="w-full bg-accent min-h-screen">
      <div className="px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-primary text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl text-center">
            Minds AI
          </h1>
          <p className="mt-4 text-center text-lg text-foreground opacity-80">Minds AI for Screening Test</p>

          <div className="grid gap-4 xl:gap-6 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto mt-10 sm:mt-14">
            {SCREENING_TESTS.map((test) => (
              <a href={test.href} target="_blank" rel="noopener noreferrer" key={test.title}>
                <div className="bg-card p-4 rounded-xl flex items-center justify-center h-[180px] shadow-md transition-transform hover:scale-[1.02]">
                  <h3 className="text-3xl font-semibold text-accent text-center">{test.title}</h3>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/" className="text-primary underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
