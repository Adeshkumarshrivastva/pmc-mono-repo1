import { NAVBAR_HEIGHT } from '@/lib/constants'

export default function OurCounselorsPage() {
  return <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}></div>
}
