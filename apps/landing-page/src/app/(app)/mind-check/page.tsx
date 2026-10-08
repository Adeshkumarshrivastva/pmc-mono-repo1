import Link from 'next/link'
import { MindCheckQuiz } from '../_components/mind-check-quiz'

export const metadata = {
  title: 'Mind Check | Positive Mind Care',
  description: 'Take the 2-minute Mind Check and get your personalised mental wellness score.',
}

export default function MindCheckPage() {
  return (
    <div className="mind-check min-h-screen bg-accent px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-primary underline underline-offset-4">
          ← Back to home
        </Link>
        {/* Page heading (hidden):
        <h1 className="mb-8 mt-4 text-center text-[clamp(1.75rem,2.6vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary">
          Our PMC Package
        </h1>
        */}
        <MindCheckQuiz mode="quiz" />
      </div>
    </div>
  )
}
