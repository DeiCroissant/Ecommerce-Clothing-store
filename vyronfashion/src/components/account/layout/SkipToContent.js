'use client'

export function SkipToContent() {
  const handleClick = (e) => {
    e.preventDefault()
    const main = document.getElementById('account-main')
    if (main) {
      main.focus()
      main.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a
      href="#account-main"
      className="skip-to-content"
      onClick={handleClick}
    >
      Bỏ qua đến nội dung chính
    </a>
  )
}
