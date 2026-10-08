type ShareButtonProps = {
  url: string
  title: string
  className?: string
}

export default function ShareButton({ url, title, className }: ShareButtonProps) {
  return (
    <a href={url} title={title} className={className}>
      Share with your Friend
    </a>
  )
}
