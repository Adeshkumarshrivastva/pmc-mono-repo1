import Link from 'next/link'

const assessmentOptions = [
  {
    title: 'Vineland Social Maturity Scale (VSMS)',
    description: [
      <>
        The <strong>Vineland Social Maturity Scale (VSMS)</strong> is a psychological assessment tool used to understand an
        individual’s <strong>social maturity, adaptive functioning, and everyday life skills</strong>. It helps assess how
        effectively a person manages age-appropriate activities and interacts with people in their surroundings.
      </>,
      <>
        The assessment covers important areas of daily functioning, including <strong>communication, self-help skills,
        personal care, social interaction, responsibility, and participation in everyday activities</strong>. It provides a
        structured understanding of an individual’s strengths and areas where additional guidance or support may be
        beneficial.
      </>,
      <>
        VSMS can be useful in understanding developmental and adaptive skill levels in children as well as individuals
        who may require additional support in their daily, social, or educational environment.
      </>,
      <>
        A <strong>qualified psychologist or trained professional</strong> administers and interprets the assessment, using
        the findings along with other relevant information to develop a better understanding of the individual’s overall
        functioning and support needs.
      </>,
    ],
  },
  {
    title: 'Malin’s Intelligence Scale for Indian Children (MISIC)',
    description: [
      <>
        The <strong>Malin’s Intelligence Scale for Indian Children (MISIC)</strong> is an individually administered
        psychological assessment designed to understand a child’s <strong>cognitive abilities, thinking skills, and
        learning potential</strong>. It provides a structured profile of different areas of intellectual functioning and
        helps professionals understand how a child processes and responds to different types of tasks.
      </>,
      <>
        The assessment can provide insights into areas such as <strong>verbal reasoning, comprehension, memory,
        problem-solving, attention, and other cognitive abilities</strong>. The results may help identify a child’s
        <strong> strengths as well as areas where additional academic, developmental, or psychological support may be
        beneficial</strong>.
      </>,
      <>
        MISIC can be used as part of a broader psychological or developmental assessment, particularly when there are
        concerns related to <strong>learning, academic performance, cognitive development, or overall intellectual
        functioning</strong>.
      </>,
      <>
        The assessment should be <strong>administered and interpreted by a qualified psychologist or trained
        professional</strong>. Results are considered alongside the child’s developmental history, educational background,
        observations, and other relevant assessments to develop a more comprehensive understanding of the child’s needs.
      </>,
    ],
  },
]

export const metadata = {
  title: 'IQ Assessments | Positive Mind Care',
  description: 'Learn about the VSMS and MISIC assessments.',
}

export default function IQAssessmentPage() {
  return (
    <main className="min-h-screen bg-accent px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#expert-assessments"
          className="inline-flex rounded-md text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ← Back to assessments
        </Link>

        <header className="mb-8 mt-8 text-center sm:mb-10">
          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.04em] text-primary">
            IQ Assessments
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-primary/80">
            Explore these assessments to learn what each one is designed to understand.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {assessmentOptions.map((assessment) => {
            return (
              <article
                key={assessment.title}
                className="rounded-2xl bg-card p-6 shadow-[0_12px_28px_rgba(30,51,42,0.08)] sm:p-8"
              >
                <h2 className="text-xl font-semibold leading-snug text-accent sm:text-2xl">
                  {assessment.title}
                </h2>
                <div className="mt-4 space-y-4 leading-relaxed text-accent/80">
                  {assessment.description.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
