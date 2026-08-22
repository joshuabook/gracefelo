const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const shareCloudName = import.meta.env.VITE_CLOUDINARY_SHARE_CLOUD_NAME
const shareUploadPreset = import.meta.env.VITE_CLOUDINARY_SHARE_UPLOAD_PRESET

export const uploadImage = async (file, useShareAccount = false) => {
  const targetCloudName = useShareAccount ? shareCloudName : cloudName
  const targetPreset = useShareAccount ? shareUploadPreset : uploadPreset
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', targetPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${targetCloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export const uploadFile = async (file, useShareAccount = false) => {
  const targetCloudName = useShareAccount ? shareCloudName : cloudName
  const targetPreset = useShareAccount ? shareUploadPreset : uploadPreset
  
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', targetPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${targetCloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Cloudinary file upload error:', error)
    throw error
  }
}

export const deleteImage = async (publicId) => {
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET
  
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = await generateSignature(publicId, timestamp, apiSecret)
  
  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    )
    return await response.json()
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}

async function generateSignature(publicId, timestamp, apiSecret) {
  const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const msgBuffer = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
