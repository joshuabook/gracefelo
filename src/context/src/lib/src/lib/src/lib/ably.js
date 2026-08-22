import Ably from 'ably'

const ablyApiKey = import.meta.env.VITE_ABLY_API_KEY

if (!ablyApiKey) {
  console.error('Missing Ably API key')
}

let ablyClient = null

export const getAblyClient = () => {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      key: ablyApiKey,
      clientId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })
  }
  return ablyClient
}

export const createChatChannel = (channelName) => {
  const client = getAblyClient()
  return client.channels.get(channelName)
}

export const subscribeToChannel = (channel, event, callback) => {
  channel.subscribe(event, callback)
  return () => channel.unsubscribe(event, callback)
}

export const publishToChannel = async (channel, event, data) => {
  try {
    await channel.publish(event, data)
    return true
  } catch (error) {
    console.error('Ably publish error:', error)
    return false
  }
}

export const getChannelPresence = async (channel) => {
  try {
    const presence = await channel.presence.get()
    return presence
  } catch (error) {
    console.error('Ably presence error:', error)
    return []
  }
}

export const enterChannelPresence = async (channel, data = {}) => {
  try {
    await channel.presence.enter(data)
    return true
  } catch (error) {
    console.error('Ably presence enter error:', error)
    return false
  }
}

export const leaveChannelPresence = async (channel) => {
  try {
    await channel.presence.leave()
    return true
  } catch (error) {
    console.error('Ably presence leave error:', error)
    return false
  }
}
