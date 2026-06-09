let notificationAudioContext

const notificationSoundPatterns = {
  request: [
    { frequency: 660, duration: 0.08 },
    { frequency: 880, duration: 0.12 },
  ],
  contractor: [
    { frequency: 392, duration: 0.1 },
    { frequency: 523, duration: 0.12 },
  ],
  supplier: [
    { frequency: 784, duration: 0.08 },
    { frequency: 659, duration: 0.13 },
  ],
  message: [
    { frequency: 523, duration: 0.07 },
    { frequency: 659, duration: 0.07 },
    { frequency: 784, duration: 0.1 },
  ],
  project: [
    { frequency: 440, duration: 0.1 },
    { frequency: 554, duration: 0.14 },
  ],
  general: [
    { frequency: 600, duration: 0.12 },
  ],
}

function getNotificationAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  if (!notificationAudioContext) {
    notificationAudioContext = new AudioContextClass()
  }
  return notificationAudioContext
}

export async function unlockNotificationAudio() {
  const audioContext = getNotificationAudioContext()
  if (audioContext?.state === 'suspended') {
    await audioContext.resume()
  }
}

export async function playNotificationSound(moduleName = 'general') {
  const audioContext = getNotificationAudioContext()
  if (!audioContext) return
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }

  const pattern = notificationSoundPatterns[moduleName] || notificationSoundPatterns.general
  let startTime = audioContext.currentTime

  pattern.forEach((tone) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(tone.frequency, startTime)
    gainNode.gain.setValueAtTime(0.0001, startTime)
    gainNode.gain.exponentialRampToValueAtTime(0.16, startTime + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.duration)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.start(startTime)
    oscillator.stop(startTime + tone.duration + 0.02)
    startTime += tone.duration + 0.035
  })
}
