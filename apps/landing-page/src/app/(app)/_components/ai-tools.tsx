import Link from 'next/link'
import ShareButton from './share-button'

const MITRA_AI_URL = 'https://mitra.timbleglance.com'
const MIND_GAME_URL = 'https://forestgreen-scorpion-490773.hostingersite.com/mind-game/'

const toolButtonClass =
  'flex items-center justify-center w-full sm:w-auto sm:min-w-[260px] h-[90px] sm:h-[110px] px-8 rounded-[1.5rem] bg-card text-accent text-lg sm:text-xl font-semibold shadow-[0_12px_28px_rgba(30,51,42,0.08)] transition-all hover:scale-[1.01]'

export default function AITools() {
  return (
    <div className="mb-12 sm:mb-16">
      <h3 className="mb-6 text-center text-[clamp(1.375rem,2vw,2rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary sm:mb-8">
        Check your mental health using our AI tool
      </h3>
      <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
        <Link href="/minds-ai" className={toolButtonClass}>
          Minds AI
        </Link>
        <a href={MITRA_AI_URL} target="_blank" rel="noopener noreferrer" className={toolButtonClass}>
          Mitra AI
        </a>
        <ShareButton
          url={MIND_GAME_URL}
          title="Check your mental health using our AI tool"
          className={toolButtonClass}
        />
      </div>
    </div>
  )
}
