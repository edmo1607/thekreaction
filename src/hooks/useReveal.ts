import { useEffect } from 'react'

/**
 * Scroll-reveal for every element with a `data-reveal` attribute.
 * When it enters the viewport we set `data-visible`; CSS does the animation.
 * A data attribute (not a class) is used so React re-renders never strip it.
 * Elements added later (filtered work cards, loaded packages) are picked up too.
 */
export function useReveal() {
  useEffect(() => {
    const show = (el: Element) => el.setAttribute('data-visible', '')

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(show)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )

    const watched = new WeakSet<Element>()
    const scan = () => {
      document.querySelectorAll('[data-reveal]:not([data-visible])').forEach((el) => {
        if (!watched.has(el)) {
          watched.add(el)
          io.observe(el)
        }
      })
    }

    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}

/** Props for a revealed element; `i` staggers siblings by ~80ms each. */
export function reveal(i = 0): { 'data-reveal': string; style: Record<string, number> } {
  return { 'data-reveal': '', style: { '--i': i } }
}
