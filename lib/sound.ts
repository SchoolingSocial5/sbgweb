let canPlaySound = false

export const initializeSound = () => {
  // Preload sounds to ensure they are available
  const preloadSound = (src: string) => {
    const audio = new Audio(src)
    audio.load()
    return audio
  }

  const testSound = preloadSound('/sounds/pop.wav')

  const enableSound = () => {
    canPlaySound = true

    testSound
      .play()
      .then(() => {
        testSound.pause()
        testSound.currentTime = 0
      })
      .catch(() => {})

    document.removeEventListener('click', enableSound)
    document.removeEventListener('touchstart', enableSound)
  }

  document.addEventListener('click', enableSound)
  document.addEventListener('touchstart', enableSound)
}

// 🔊 Play a fresh instance of the pop sound
export const playPopSound = () => {
  if (!canPlaySound) return
  const sound = new Audio('/sounds/transaction.mp3')
  sound.play().catch((err) => {
    console.error('Unable to play pop sound:', err.message)
  })
}

// 🔔 Play a fresh instance of the notification sound
export const playNotificationSound = () => {
  if (!canPlaySound) return
  const sound = new Audio('/sounds/verification.wav')
  sound.play().catch((err) => {
    console.error('Unable to play notification sound:', err.message)
  })
}
