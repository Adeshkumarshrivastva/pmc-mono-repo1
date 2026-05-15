'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getAltFromFromMedia, getURLFromMedia } from '@/payload/utils'
import type { Media, PopupNotification } from '@/payload/types'

type PopupNotificationDialogProps = {
  popups: PopupNotification[]
}

export default function PopupNotificationDialog({ popups }: PopupNotificationDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Open popup after 600ms
    const openTimer = setTimeout(() => {
      setOpen(true)
    }, 600)

    return () => clearTimeout(openTimer)
  }, [])

  if (popups.length === 0) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
      }}
    >
      <DialogContent
        className={`${
          popups.length === 1 ? 'max-w-3xl' : 'max-w-[95vw] lg:max-w-7xl'
        } w-full p-0 overflow-hidden rounded-xl border-0 shadow-2xl mt-8 bg-transparent`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>

        <div
          className={`flex ${
            popups.length === 1 ? 'justify-center' : 'flex-col lg:flex-row'
          } gap-4 lg:gap-6`}
        >
          {popups.map((popup) => (
            <div
              key={popup.id}
              className={`relative ${
                popups.length === 1 ? 'w-full' : 'w-full lg:w-1/2'
              } flex flex-col bg-black rounded-xl overflow-hidden`}
            >
              {popup.image ? (
                <div className="relative w-full max-h-[60vh] overflow-hidden">
                  <img
                    src={getURLFromMedia(popup.image as Media)}
                    alt={getAltFromFromMedia(popup.image as Media)}
                    className="w-full h-auto block object-contain max-h-[60vh]"
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-white">No image available</p>
                </div>
              )}

              <div className="w-full bg-gradient-to-b from-gray-900 to-black py-4 px-4 sm:px-6">
                <div className="flex flex-col gap-3">
                  {/* Primary and Secondary Buttons Row */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {popup.primaryButton?.link && (
                      <Link
                        href={popup.primaryButton.link}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-yellow-500 hover:bg-yellow-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-black shadow-xl transition-all hover:scale-105 uppercase"
                      >
                        {popup.primaryButton.text || 'BOOK NOW'}
                      </Link>
                    )}

                    {popup.secondaryButton?.link && (
                      <Link
                        href={popup.secondaryButton.link}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-white hover:bg-gray-100 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-black shadow-xl transition-all hover:scale-105 uppercase"
                      >
                        {popup.secondaryButton.text || 'RETURN POLICY'}
                      </Link>
                    )}
                  </div>

                  {/* See More Button */}
                  {(popup as any).seeMoreLink && (
                    <Link
                      href={(popup as any).seeMoreLink}
                      className="w-full inline-flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
                    >
                      See More Details →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
