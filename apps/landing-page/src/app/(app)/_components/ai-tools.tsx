import Link from 'next/link'

const MITRA_AI_URL = 'https://mitra.timbleglance.com'

const toolButtonClass =
  'flex items-center justify-center w-full sm:w-auto sm:min-w-[260px] h-[100px] sm:h-[140px] px-10 rounded-2xl bg-card text-accent text-2xl sm:text-3xl font-semibold shadow-md transition-all hover:scale-[1.02]'

export default function AITools() {
  return (
    <div className="mt-8 sm:mt-10">
      <h3 className="text-3xl sm:text-4xl font-semibold text-primary text-center mb-6 sm:mb-8">Our AI Tools</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <Link href="/minds-ai" className={toolButtonClass}>
          Minds AI
        </Link>
        <a href={MITRA_AI_URL} target="_blank" rel="noopener noreferrer" className={toolButtonClass}>
          Mitra AI
        </a>
      </div>
    </div>
  )
}
