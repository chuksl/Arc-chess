export function playWinSound() {
  if (typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  const notes = [261.63, 329.63, 392.0, 523.25]
  const duration = 0.15

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + index * duration)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * duration + duration)

    oscillator.start(audioContext.currentTime + index * duration)
    oscillator.stop(audioContext.currentTime + index * duration + duration)
  })

  setTimeout(
    () => {
      const cheerOscillator = audioContext.createOscillator()
      const cheerGain = audioContext.createGain()

      cheerOscillator.connect(cheerGain)
      cheerGain.connect(audioContext.destination)

      cheerOscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      cheerOscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5)
      cheerOscillator.type = "triangle"

      cheerGain.gain.setValueAtTime(0.2, audioContext.currentTime)
      cheerGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      cheerOscillator.start(audioContext.currentTime)
      cheerOscillator.stop(audioContext.currentTime + 0.5)
    },
    notes.length * duration * 1000,
  )
}

export function playLossSound() {
  if (typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  const notes = [392.0, 329.63, 261.63, 196.0]
  const duration = 0.2

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sawtooth"

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * duration)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * duration + duration)

    oscillator.start(audioContext.currentTime + index * duration)
    oscillator.stop(audioContext.currentTime + index * duration + duration)
  })

  setTimeout(
    () => {
      const booOscillator = audioContext.createOscillator()
      const booGain = audioContext.createGain()

      booOscillator.connect(booGain)
      booGain.connect(audioContext.destination)

      booOscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      booOscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.6)
      booOscillator.type = "sawtooth"

      booGain.gain.setValueAtTime(0.15, audioContext.currentTime)
      booGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

      booOscillator.start(audioContext.currentTime)
      booOscillator.stop(audioContext.currentTime + 0.6)
    },
    notes.length * duration * 1000,
  )
}

export function playDrawSound() {
  if (typeof window === "undefined") return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 300
  oscillator.type = "square"

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 1)
}
