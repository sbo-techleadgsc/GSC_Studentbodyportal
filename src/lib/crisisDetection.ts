// Crisis detection utility for mental health and safety keywords
// This helps identify when users may need immediate support

const CRISIS_KEYWORDS = [
  // Suicide and self-harm
  'suicide', 'kill myself', 'end my life', 'want to die', 'don\'t want to live',
  'self harm', 'cutting', 'hurt myself', 'end it all',
  
  // Severe distress
  'depressed', 'hopeless', 'worthless', 'can\'t go on', 'giving up',
  'no reason to live', 'better off dead', 'want to disappear',
  
  // Mental health crisis indicators
  'mental breakdown', 'panic attack', 'anxiety attack', 'having a breakdown',
  'can\'t cope', 'overwhelmed', 'crisis', 'emergency',
  
  // Harm to others
  'hurt someone', 'harm others', 'violent thoughts', 'want to hurt',
]

const MENTAL_HEALTH_CATEGORY = 'mental-health'

/**
 * Detects if text contains crisis-related keywords
 * @param text - The text to analyze
 * @returns true if crisis keywords are detected
 */
export function detectCrisisKeywords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

/**
 * Detects if the category is mental health related
 * @param category - The report category
 * @returns true if category is mental health
 */
export function isMentalHealthCategory(category: string): boolean {
  return category === MENTAL_HEALTH_CATEGORY
}

/**
 * Combined check for crisis detection
 * @param text - The report content text
 * @param category - The report category
 * @returns true if either crisis keywords or mental health category is detected
 */
export function shouldTriggerCrisisInterceptor(text: string, category: string): boolean {
  return detectCrisisKeywords(text) || isMentalHealthCategory(category)
}

/**
 * Crisis hotline information
 */
export const CRISIS_HOTLINES = [
  {
    name: 'Good Samaritan Colleges Guidance Counseling Office',
    phone: '+63 XXX XXX XXXX', // Replace with actual number
    description: 'On-campus counseling support',
  },
  {
    name: 'National Center for Mental Health (NCMH) Hotline',
    phone: '1553',
    description: '24/7 mental health crisis line',
  },
  {
    name: 'Hopeline PH',
    phone: '0917-558-HOPE (4673)',
    description: '24/7 suicide prevention and crisis support',
  },
]
