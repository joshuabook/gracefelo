const BIBLE_API_BASE = 'https://labs.bible.org/api'
const BIBLE_API_V2 = 'https://bible-api.com'

export const getRandomVerse = async () => {
  try {
    const response = await fetch(`${BIBLE_API_BASE}/?passage=random&type=json`)
    const data = await response.json()
    return data[0]
  } catch (error) {
    console.error('Error fetching random verse:', error)
    return null
  }
}

export const getSpecificVerse = async (book, chapter, verse) => {
  try {
    const response = await fetch(`${BIBLE_API_V2}/${book}+${chapter}:${verse}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching specific verse:', error)
    return null
  }
}

export const getDailyVerse = async () => {
  const verses = [
    {
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      reference: "John 3:16",
      category: "Love"
    },
    {
      text: "The Lord is my shepherd, I lack nothing.",
      reference: "Psalm 23:1",
      category: "Guidance"
    },
    {
      text: "I can do all this through him who gives me strength.",
      reference: "Philippians 4:13",
      category: "Strength"
    },
    {
      text: "Trust in the Lord with all your heart and lean not on your own understanding.",
      reference: "Proverbs 3:5",
      category: "Faith"
    },
    {
      text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      reference: "Joshua 1:9",
      category: "Courage"
    },
    {
      text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.",
      reference: "Isaiah 40:31",
      category: "Hope"
    },
    {
      text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      reference: "Romans 8:28",
      category: "Purpose"
    },
    {
      text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.",
      reference: "Numbers 6:24-25",
      category: "Blessing"
    },
    {
      text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
      reference: "Philippians 4:6",
      category: "Peace"
    },
    {
      text: "Your word is a lamp for my feet, a light on my path.",
      reference: "Psalm 119:105",
      category: "Wisdom"
    }
  ]
  
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  return verses[dayOfYear % verses.length]
}

export const searchVerses = async (query) => {
  try {
    const response = await fetch(`${BIBLE_API_BASE}/?passage=${encodeURIComponent(query)}&type=json`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error searching verses:', error)
    return []
  }
}
