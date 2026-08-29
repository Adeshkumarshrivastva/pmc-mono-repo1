import { cn } from '@/lib/utils'
import type { DeepTm } from '@/payload/types'

type ComparisonTableSectionProps = {
  data: DeepTm['deepTmsComparisonSection']
}

export default function ComparisonTableSection({ data }: ComparisonTableSectionProps) {
  if (!data) return null

  return (
    <section className="hidden md:block w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-24">
          {data?.title && (
            <h2 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl text-center">{data.title}</h2>
          )}

          <div className="overflow-hidden rounded-2xl border border-card p-0">
            <table className="w-full overflow-hidden">
              <thead>
                <tr>
                  <th className="w-1/3 text-center">
                    <div className={cn('p-6', `bg-${data?.featureParameterColumn?.background}`)}>
                      <h3
                        className={cn(
                          'text-lg text-primary font-semibold',
                          `text-${data?.featureParameterColumn?.textColor}`,
                        )}
                      >
                        {data?.featureParameterColumn?.heading}
                      </h3>
                    </div>
                  </th>
                  <th className="w-1/3 text-center">
                    <div className={cn('p-6', `bg-${data?.deepTmsFeatureColumn?.background}`)}>
                      <h3
                        className={cn(
                          'text-lg text-primary font-semibold',
                          `text-${data?.deepTmsFeatureColumn?.textColor}`,
                        )}
                      >
                        {data?.deepTmsFeatureColumn?.heading}
                      </h3>
                    </div>
                  </th>
                  <th className="w-1/3 text-center">
                    <div className={cn('p-6', `bg-${data?.traditionalFeatureColumn?.background}`)}>
                      <h3
                        className={cn(
                          'text-lg text-primary font-semibold',
                          `text-${data?.traditionalFeatureColumn?.textColor}`,
                        )}
                      >
                        {data?.traditionalFeatureColumn?.heading}
                      </h3>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.comparisonRows && data.comparisonRows.length > 0
                  ? data.comparisonRows.map((row, index) => {
                      const isLastRow = index === (data.comparisonRows?.length ?? 0) - 1

                      return (
                        <tr key={row.id}>
                          <td className="w-1/3 text-center">
                            <div
                              className={cn(
                                'p-6',
                                `bg-${data?.featureParameterColumn?.background} text-${data?.featureParameterColumn?.textColor}`,
                                !isLastRow && 'border-b border-border',
                              )}
                            >
                              {row.feature}
                            </div>
                          </td>
                          <td className="w-1/3 text-center">
                            <div
                              className={cn(
                                'p-6',
                                `bg-${data?.deepTmsFeatureColumn?.background} text-${data?.deepTmsFeatureColumn?.textColor}`,
                                !isLastRow && 'border-b border-border',
                              )}
                            >
                              {row.deepTmsFeature}
                            </div>
                          </td>
                          <td className="w-1/3 text-center">
                            <div
                              className={cn(
                                'p-6',
                                `bg-${data?.traditionalFeatureColumn?.background} text-${data?.traditionalFeatureColumn?.textColor}`,
                                !isLastRow && 'border-b border-border',
                              )}
                            >
                              {row.traditionalFeature}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
