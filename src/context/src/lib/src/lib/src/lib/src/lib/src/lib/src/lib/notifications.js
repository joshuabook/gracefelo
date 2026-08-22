export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

export const showNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    })
  }
}

export const scheduleNotification = (title, options = {}, delayMs) => {
  if (delayMs < 0) return

  setTimeout(() => {
    showNotification(title, options)
  }, delayMs)
}

export const scheduleDailyNotification = (title, options = {}, hour = 6, minute = 0) => {
  const now = new Date()
  const scheduledTime = new Date(now)
  scheduledTime.setHours(hour, minute, 0, 0)

  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const delay = scheduledTime.getTime() - now.getTime()
  scheduleNotification(title, options, delay)
}
