import './LyricsDisplay.css'

function LyricsDisplay({ lyrics }) {
  // Smart word pairing that handles mismatched word counts
  const pairWords = (originalLine, pronunciationLine) => {
    const originalWords = originalLine.split(/\s+/).filter(w => w)
    const pronunciationWords = pronunciationLine ? pronunciationLine.split(/\s+/).filter(w => w) : []
    
    const pairs = []
    const maxLen = Math.max(originalWords.length, pronunciationWords.length)
    
    for (let i = 0; i < maxLen; i++) {
      pairs.push({
        original: originalWords[i] || '',
        pronunciation: pronunciationWords[i]?.replace(/-/g, ' ') || '' // Convert hyphens back to spaces for display
      })
    }
    
    return pairs
  }

  return (
    <div className="lyrics-container">
      {lyrics.map((line, lineIndex) => {
        const wordPairs = pairWords(line.original, line.pronunciation)
        
        return (
          <div key={lineIndex} className="lyrics-line">
            {wordPairs.map((pair, wordIndex) => (
              <div key={wordIndex} className="word-block">
                {pair.original && (
                  <span className="original-word">{pair.original}</span>
                )}
                {pair.pronunciation && (
                  <span className="pronunciation-word">{pair.pronunciation}</span>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default LyricsDisplay
