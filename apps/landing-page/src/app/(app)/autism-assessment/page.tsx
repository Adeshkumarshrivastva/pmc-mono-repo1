import Link from 'next/link'

const assessmentOptions = [
  {
    title: 'Indian Scale for Assessment of Autism (ISAA)',
    description: [
      <>
        The <strong>Indian Scale for Assessment of Autism (ISAA)</strong> is a structured assessment tool designed to
        understand the <strong>severity and characteristics of autism-related difficulties</strong> in children and
        individuals. It provides a systematic way of assessing areas of functioning that may be affected by Autism
        Spectrum Disorder (ASD).
      </>,
      <>
        The assessment focuses on key areas such as <strong>social interaction and relationships, communication,
        emotional responses, repetitive or unusual behaviors, sensory responses, and cognitive or behavioral
        patterns</strong>. It helps provide a clearer picture of an individual’s strengths, challenges, and level of
        support that may be required in everyday life.
      </>,
      <>
        ISAA can be useful as part of a <strong>comprehensive autism assessment</strong>, particularly when there are
        concerns related to communication, social interaction, behavior, sensory responses, or developmental
        functioning. The assessment may also help professionals understand the level of support and intervention that
        could be beneficial.
      </>,
      <>
        The ISAA should be <strong>administered and interpreted by a qualified psychologist or trained professional</strong>.
        The results are considered alongside developmental history, clinical observations, interviews, and other
        relevant assessments to develop a comprehensive understanding of the individual’s needs.
      </>,
      <>
        The findings can support professionals and families in planning appropriate{' '}
        <strong>behavioral, developmental, educational, and therapeutic interventions</strong> based on the individual’s
        specific requirements.
      </>,
    ],
  },
  {
    title: 'Childhood Autism Rating Scale (CARS)',
    description: [
      <>
        The <strong>Childhood Autism Rating Scale (CARS)</strong> is a structured assessment tool used to evaluate
        behaviors and characteristics associated with <strong>Autism Spectrum Disorder (ASD)</strong>. It helps
        professionals understand the presence and severity of autism-related characteristics by observing and
        assessing a child’s behavior across different areas of development and functioning.
      </>,
      <>
        CARS examines several important areas, including <strong>social interaction, communication, emotional responses,
        imitation, body and object use, adaptation to change, sensory responses, and other behavioral patterns</strong>.
        It provides a structured profile that can help identify areas of difficulty as well as the level of support a
        child may require.
      </>,
      <>
        The assessment can be particularly useful when there are concerns regarding <strong>social communication,
        repetitive behaviors, sensory sensitivities, developmental differences, or difficulties in adapting to everyday
        situations</strong>.
      </>,
      <>
        CARS is generally used as part of a <strong>comprehensive developmental or psychological evaluation</strong> and
        should not be considered a standalone diagnostic tool. A qualified psychologist or trained professional
        interprets the assessment findings along with developmental history, clinical observations, parent or caregiver
        reports, and other relevant assessments.
      </>,
      <>
        The results can help professionals and families better understand a child’s needs and support the planning of
        appropriate <strong>behavioral, developmental, educational, and therapeutic interventions</strong>.
      </>,
    ],
  },
]

export const metadata = {
  title: 'Autism Assessments | Positive Mind Care',
  description: 'Learn about the ISAA and Childhood Autism Rating Scale (CARS).',
}

export default function AutismAssessmentPage() {
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
            Autism Assessments
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-primary/80">
            Learn what each assessment is designed to understand.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {assessmentOptions.map((assessment) => (
            <article
              key={assessment.title}
              className="rounded-2xl bg-card p-6 shadow-[0_12px_28px_rgba(30,51,42,0.08)] sm:p-8"
            >
              <h2 className="text-xl font-semibold leading-snug text-accent sm:text-2xl">{assessment.title}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-accent/80">
                {assessment.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
