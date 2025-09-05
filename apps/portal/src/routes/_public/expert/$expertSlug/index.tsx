import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/expert/$expertSlug/')({
  component: ExpertPage,
})

function ExpertPage() {
  return <div>Expert Page</div>
}
