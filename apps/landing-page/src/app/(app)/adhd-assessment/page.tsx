import Link from 'next/link'

const assessmentOptions = [
  {
    title: 'Conners 3 (Long Form)',
    description: [
      <>
        The <strong>Conners 3 (Long Form)</strong> is a comprehensive behavioral assessment used to understand symptoms
        and behaviors commonly associated with <strong>Attention-Deficit/Hyperactivity Disorder (ADHD)</strong> in
        children and adolescents. It provides a detailed view of attention, impulsivity, hyperactivity, and other
        behavioral and emotional concerns that may affect a child’s daily functioning.
      </>,
      <>
        The assessment can provide insights into areas such as <strong>inattention, hyperactivity and impulsivity,
        executive functioning, learning difficulties, peer relationships, and emotional or behavioral concerns</strong>.
        It may also help identify patterns of behavior across different settings and highlight areas where further
        evaluation or support may be beneficial.
      </>,
      <>
        Conners 3 is generally used as part of a <strong>comprehensive psychological or behavioral assessment</strong> and
        is not intended to establish a diagnosis on its own. A qualified psychologist or trained professional
        interprets the results along with clinical history, observations, interviews, and other relevant information.
      </>,
      <>
        The findings can help professionals develop a better understanding of a child’s behavioral and functional needs
        and guide appropriate <strong>academic, behavioral, psychological, or developmental support</strong>.
      </>,
    ],
  },
  {
    title: 'Vanderbilt Assessment Scale',
    description: [
      <>
        The <strong>Vanderbilt Assessment Scale</strong> is a structured behavioral assessment used to evaluate symptoms
        commonly associated with <strong>Attention-Deficit/Hyperactivity Disorder (ADHD)</strong> in children. It helps
        gather information about a child’s attention, activity level, behavior, and emotional functioning across
        everyday settings.
      </>,
      <>
        The scale assesses areas such as <strong>inattention, hyperactivity and impulsivity</strong>, along with other
        behavioral and emotional concerns that may affect a child’s <strong>academic performance, relationships,
        classroom behavior, and daily activities</strong>. It may also provide information about difficulties such as
        oppositional behavior, conduct-related concerns, anxiety, or mood-related symptoms.
      </>,
      <>
        The Vanderbilt Assessment Scale is typically completed by <strong>parents and/or teachers</strong>, providing
        valuable observations of the child’s behavior in different environments. This can help professionals understand
        whether certain behaviors are occurring consistently across settings.
      </>,
      <>
        The assessment is generally used as part of a <strong>comprehensive ADHD and behavioral evaluation</strong> and
        should not be considered a standalone diagnostic test. A qualified psychologist or other trained professional
        interprets the results along with clinical history, interviews, observations, and other relevant assessments.
      </>,
      <>
        The findings can help identify areas of concern and support the development of appropriate{' '}
        <strong>academic, behavioral, psychological, or developmental interventions</strong> tailored to the child’s needs.
      </>,
    ],
  },
]

export const metadata = {
  title: 'ADHD Assessments | Positive Mind Care',
  description: 'Learn about the Conners 3 (Long Form) and Vanderbilt Assessment Scale.',
}

export default function ADHDAssessmentPage() {
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
            ADHD Assessments
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
