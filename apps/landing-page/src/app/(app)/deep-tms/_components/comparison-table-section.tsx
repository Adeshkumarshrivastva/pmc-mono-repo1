import { cn } from '@/lib/utils'
import { DeepTm } from '@/payload/types'

type ComparisonTableSectionProps = {
    data: DeepTm['deepTmsComparisonSection']
}

export default function ComparisonTableSection({ data }: ComparisonTableSectionProps) {
    return (
        <section className="hidden md:block w-full bg-accent">
            <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-25">
                <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-24">
                    <h2 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl flex justify-center">
                        {data?.title}
                    </h2>
                    <div className="overflow-hidden">
                        <table className='w-full border border-card'>
                            <thead >
                                <tr className=''>
                                    <th className="w-1/3 text-center">
                                        {/* TODO: Make background color dynamic */}
                                        <div className={cn('text-white p-6', `bg-card`)}>
                                            <h3 className="text-lg font-semibold">{data?.featureParameterColumn?.heading}</h3>
                                        </div>
                                    </th>
                                    <th className="w-1/3 text-center">
                                        {/* TODO: Make background color dynamic */}
                                        <div className={cn('text-white p-6', `bg-primary-foreground`)}>
                                            <h3 className="text-lg text-primary font-semibold">{data?.deepTmsFeatureColumn?.heading}</h3>
                                        </div>
                                    </th>
                                    <th className="w-1/3 text-center">
                                        {/* TODO: Make background color dynamic */}
                                        <div className={cn('text-white p-6', `bg-card`)}>
                                            <h3 className="text-lg font-semibold">{data?.traditionalFeatureColumn?.heading}</h3>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}
