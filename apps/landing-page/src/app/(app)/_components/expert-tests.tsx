import Link from 'next/link'

const EXPERT_TESTS = ['IQ Assessment', 'Adhd Assessment', 'Personality Assessment','Autism Assessment']

const testButtonClass =
  'flex items-center justify-center w-full h-[90px] sm:h-[110px] px-4 rounded-[1.5rem] bg-card text-accent text-base sm:text-lg font-semibold whitespace-nowrap shadow-[0_12px_28px_rgba(30,51,42,0.08)] transition-all hover:scale-[1.01]'

export default function ExpertTests() {
  return (
    <div id="expert-assessments" className="mt-12 sm:mt-16">
      <h3 className="mb-6 text-center text-[clamp(1.375rem,2vw,2rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary sm:mb-8">
        Check your mental health with help of our Experts
      </h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        {EXPERT_TESTS.map((test) => (
          <Link
            key={test}
            href={
              test === 'IQ Assessment'
                ? '/iq-assessment'
                : test === 'Adhd Assessment'
                  ? '/adhd-assessment'
                  : test === 'Personality Assessment'
                    ? '/personality-assessment'
                  : test === 'Autism Assessment'
                    ? '/autism-assessment'
                    : '/quiz'
            }
            className={testButtonClass}
          >
            {test}
          </Link>
        ))}
      </div>
    </div>
  )
}
