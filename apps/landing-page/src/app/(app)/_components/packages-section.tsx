import { Home } from '@/payload/types'

type PackagesSectionProps = {
  data: Home['packagesSection']
}

export default function PackagesSection({ data }: PackagesSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-25">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16"></div>
      </div>
    </section>
  )
}
