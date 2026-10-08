import Link from 'next/link'

const assessmentOptions = [
  {
    title: 'TCI – Temperament and Character Inventory',
    description: [
      <>
        The <strong>Temperament and Character Inventory (TCI)</strong> is a personality assessment designed to
        understand an individual’s <strong>temperament, character, and patterns of personality functioning</strong>. It
        provides a detailed profile of how a person typically responds to experiences, interacts with others, manages
        emotions, and approaches different situations.
      </>,
      <>
        The TCI examines important personality dimensions related to <strong>temperament and character development</strong>,
        providing insights into areas such as emotional responses, behavioral tendencies, self-regulation,
        interpersonal functioning, and personal values.
      </>,
      <>
        The assessment can help professionals develop a deeper understanding of an individual’s{' '}
        <strong>personality strengths, behavioral patterns, coping styles, and areas that may benefit from further
        support or psychological intervention</strong>.
      </>,
      <>
        TCI is generally used as part of a broader <strong>psychological or personality assessment</strong> and should be
        interpreted by a qualified psychologist or trained professional. The results are considered together with
        clinical history, interviews, observations, and other relevant assessments for a more comprehensive
        understanding of the individual’s personality and functioning.
      </>,
    ],
  },
  {
    title: 'International Personality Disorder Examination (IPDE)',
    description: [
      <>
        The <strong>International Personality Disorder Examination (IPDE)</strong> is a structured clinical assessment
        used to evaluate <strong>personality characteristics and patterns of functioning</strong> that may be associated
        with personality disorders. It provides a systematic framework for understanding long-standing patterns in an
        individual’s thoughts, emotions, relationships, and behavior.
      </>,
      <>
        The assessment explores different areas of personality functioning, including <strong>interpersonal
        relationships, emotional regulation, self-image, impulse control, behavioral patterns, and ways of responding
        to different situations</strong>. It can help professionals identify persistent patterns that may affect an
        individual’s personal, social, or occupational functioning.
      </>,
      <>
        IPDE may be used as part of a <strong>comprehensive psychological or psychiatric evaluation</strong>,
        particularly when there are concerns regarding long-standing interpersonal difficulties, emotional
        instability, behavioral patterns, or personality-related concerns.
      </>,
      <>
        The assessment should be <strong>administered and interpreted by a qualified mental health professional</strong>.
        Findings are considered alongside clinical interviews, personal history, behavioral observations, and other
        relevant psychological assessments to develop a comprehensive understanding of the individual.
      </>,
    ],
  },
]

export const metadata = {
  title: 'Personality Assessments | Positive Mind Care',
  description: 'Learn about the TCI and IPDE personality assessments.',
}

export default function PersonalityAssessmentPage() {
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
            Personality Assessments
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
