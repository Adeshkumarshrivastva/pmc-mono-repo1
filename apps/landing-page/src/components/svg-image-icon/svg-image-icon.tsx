'use client'

import { useQuery } from '@tanstack/react-query'

type SVGImageIconProps = {
  src: string
  className?: string
  style?: React.CSSProperties
}

const SVG_MIME_TYPE = 'image/svg+xml'

export default function SVGImageIcon({ src, className, style }: SVGImageIconProps) {
  const imageQuery = useQuery({
    queryKey: ['svg-image-icon', src],
    queryFn: async () => {
      const res = await fetch(src)
      if (!res.ok) {
        throw new Error(`Failed to fetch SVG image from ${src}`)
      }
      const contentType = res.headers.get('content-type')

      if (contentType !== SVG_MIME_TYPE) {
        throw new Error(`Invalid content type: expected SVG_MIME_TYPE, got '${contentType}'`)
      }

      const text = await res.text()
      const domParser = new DOMParser()
      const svg = domParser.parseFromString(text, SVG_MIME_TYPE)
      svg.documentElement.style.width = '100%'
      svg.documentElement.style.height = '100%'
      return svg.documentElement.outerHTML
    },
  })

  if (imageQuery.status !== 'success') {
    return null
  }

  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: imageQuery.data }} />
}
