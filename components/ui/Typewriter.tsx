'use client'

import { useEffect, useState } from 'react'

interface Props {
  text: string
  speed?: number
}

export default function Typewriter({ text, speed = 50 }: Props) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let i = 0

    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i))
      i++

      if (i > text.length) {
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <>{displayText}</>
}