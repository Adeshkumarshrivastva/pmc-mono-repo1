'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getURLFromMedia } from '@/payload/utils'
import type { Media } from '@/payload/types'

type PopupDialogProps = {
  id: string
  popupName: string
  heading: string
  description?: string | null
  image?: Media | string | null
  link?: string | null
  ctaText?: string | null
}

export default function PopupDialog({ popupName, heading, description, image, link, ctaText }: PopupDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const imageUrl = image ? getURLFromMedia(image) : null
  const imageAlt = image && typeof image === 'object' ? ((image as Media).alt ?? '') : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">{popupName}</DialogTitle>
          {imageUrl && (
            <div className="relative w-full rounded-lg mt-4 h-52">
              <Image src={imageUrl} alt={imageAlt || popupName} fill className="object-cover rounded-lg" priority />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
        </DialogHeader>

        <div className="p-0 space-y-2">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <p className="text-md text-gray-600 leading-relaxed">{description}</p>
          {link && (
            <Link
              href={link}
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary mt-4 p-4 py-2.5 text-md font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ctaText || 'Grab the offer →'}
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
