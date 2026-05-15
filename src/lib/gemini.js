import { supabase } from './supabase'

/**
 * Calls the secure Supabase Edge Function to extract vocabulary from lyrics.
 * The Gemini API key is stored server-side — NEVER exposed to the browser.
 */
export const extractVocabularyFromLyrics = async (lyrics) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('You must be signed in to generate vocabulary.')
  }

  const response = await supabase.functions.invoke('generate-vocabulary', {
    body: { lyrics },
  })

  if (response.error) {
    // Try to extract the real error from the edge function response
    let errorMsg = 'Failed to generate vocabulary'

    // If the edge function returned JSON with an error field
    if (response.data && response.data.error) {
      errorMsg = response.data.error
    } else if (response.error.message) {
      errorMsg = response.error.message
    }

    throw new Error(errorMsg)
  }

  // The edge function returns the vocab array directly
  return response.data
}
