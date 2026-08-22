const upstashUrl = import.meta.env.VITE_UPSTASH_REDIS_REST_URL
const upstashToken = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

export const redisGet = async (key) => {
  try {
    const response = await fetch(`${upstashUrl}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Upstash GET error:', error)
    return null
  }
}

export const redisSet = async (key, value, ttlSeconds = 3600) => {
  try {
    const response = await fetch(`${upstashUrl}/set/${key}/${value}?EX=${ttlSeconds}`, {
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })
    return await response.json()
  } catch (error) {
    console.error('Upstash SET error:', error)
    return null
  }
}

export const redisIncrement = async (key) => {
  try {
    const response = await fetch(`${upstashUrl}/incr/${key}`, {
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Upstash INCR error:', error)
    return null
  }
}

export const redisDelete = async (key) => {
  try {
    const response = await fetch(`${upstashUrl}/del/${key}`, {
      headers: {
        Authorization: `Bearer ${upstashToken}`,
      },
    })
    return await response.json()
  } catch (error) {
    console.error('Upstash DEL error:', error)
    return null
  }
}
