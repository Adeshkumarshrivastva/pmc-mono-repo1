'use client'

import { WhatsappSVG } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

type FloatingWhatsappProps = {
  phone?: string
  message?: string
  className?: string
}

export default function FloatingWhatsapp({
  phone = '+918920775098',
  message = 'Hi, I have a question!',
  className = '',
}: FloatingWhatsappProps) {
  const href = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        'fixed bottom-4 sm:bottom-2 right-16 sm:mr-2 z-50 group transition-transform duration-300 ease-out',
        className,
      )}
    >
      <div
        className="
          size-11 sm:size-14 bg-[#25d366] rounded-full
          flex items-center justify-center
          shadow-sm hover:shadow-xl
          transition-all duration-300
        "
      >
        <WhatsappSVG className="size-7 fill-white transition-transform" />
      </div>
    </a>
  )
}
