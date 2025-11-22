import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function ScrollToTop() {
  const { pathname } = useLocation() // gets the current route path

  useEffect(() => {
    window.scrollTo(0, 0) // scroll to top whenever pathname changes
  }, [pathname])

  return null 
}

export default ScrollToTop