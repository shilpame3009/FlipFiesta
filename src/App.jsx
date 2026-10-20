import { useEffect, useState } from 'react'
import './App.css'

function shuffleCards(cardsToShuffle) {
  return [...cardsToShuffle].sort(() => Math.random() - 0.5)
}

function App() {
  const cardThemes = {
    sweet: {
      title: 'Sweet shop',
      symbols: [
        '🍓', '🍋', '🍊', '🍇', '🍒', '🍉', '🧁', '🍩',
        '🍰', '🍪', '🍫', '🍬', '🍭', '🍮', '🍡', '🥧',
        '🍨', '🍦', '🍧', '🥞', '🧇', '🍯', '🧋', '🥤',
        '🍎', '🍐', '🍑', '🍍', '🥝', '🥥', '🍌', '🫐',
      ],
    },
    garden: {
      title: 'Garden party',
      symbols: [
        '🌸', '🌼', '🌻', '🌷', '🍄', '🌿', '🦋', '🐝',
        '🌱', '🍀', '🌳', '🌲', '🌴', '🌵', '🌹', '🪻',
        '💐', '🪷', '🥀', '🍁', '🍂', '🍃', '🌾', '🪴',
        '🌰', '🐞', '🐛', '🐜', '🐌', '🦗', '🐸', '🐿',
      ],
    },
    ocean: {
      title: 'Ocean friends',
      symbols: [
        '🐠', '🐙', '🪼', '🐚', '🦀', '🐬', '⭐', '🌊',
        '🐳', '🦈', '🐡', '🐢', '🦭', '🪸', '🐟', '🦑',
        '🦐', '🦞', '🦦', '🫧', '🐋', '🐊', '🐧', '🦆',
        '🦢', '🐸', '🐍', '🌧️', '⛈️', '💧', '🚣', '⚓',
      ],
    },
    pink: {
      title: 'Pink paradise',
      symbols: [
        '🩷', '💖', '💗', '💓', '💕', '💞', '💘', '💝',
        '💟', '🎀', '🌸', '🌷', '🌺', '🪷', '🌹', '🦩',
        '🩰', '👛', '💄', '👚', '🧁', '🍓', '🍬', '🍭',
        '🍡', '🍧', '🍑', '🌼', '💐', '🦋', '🐷', '🪸',
      ],
    },
  }

  const savedTheme = localStorage.getItem('flipFiestaTheme')
  const savedDifficulty = Number(localStorage.getItem('flipFiestaDifficulty'))
  const [selectedTheme, setSelectedTheme] = useState(
    cardThemes[savedTheme] ? savedTheme : 'sweet'
  )
  const [pairCount, setPairCount] = useState(
    [2, 4, 8, 16, 32].includes(savedDifficulty) ? savedDifficulty : 8
  )
  const challengePairs = Math.min(3, pairCount)
  const cardSymbols = cardThemes[selectedTheme].symbols
  const themeTitle = cardThemes[selectedTheme].title
  const [cards, setCards] = useState(() =>
    shuffleCards([...cardSymbols.slice(0, pairCount), ...cardSymbols.slice(0, pairCount)])
  )

  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCards, setMatchedCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [bestMoves, setBestMoves] = useState(
    Number(localStorage.getItem(`flipFiestaBestMoves-${pairCount}`)) ||
      (pairCount === 8 ? Number(localStorage.getItem('flipFiestaBestMoves')) : 0)
  )
  const [streak, setStreak] = useState(0)
  const [badgeEarned, setBadgeEarned] = useState(
    localStorage.getItem('sprinkleBadge') === 'true'
  )

  useEffect(() => {
    if (!timerStarted || isPaused) {
      return
    }

    const timer = setInterval(() => {
      setSeconds((seconds) => seconds + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timerStarted, isPaused])

  function handlePauseToggle() {
    setIsPaused((paused) => !paused)
  }

  function handlePeekCards() {
    if (showHint || isPaused || matchedCards.length === cards.length) {
      return
    }

    setShowHint(true)
    setTimeout(() => {
      setShowHint(false)
    }, 1200)
  }

  function handleCardClick(cardIndex) {
    if (showHint || isPaused) {
      return
    }

    if (flippedCards.length === 2) {
      return
    }

    if (flippedCards.includes(cardIndex)) {
      return
    }

    if (matchedCards.includes(cardIndex)) {
      return
    }

    if (!timerStarted) {
      setTimerStarted(true)
    }

    const nextFlippedCards = [...flippedCards, cardIndex]
    setFlippedCards(nextFlippedCards)

    if (nextFlippedCards.length === 2) {
      setMoves(moves + 1)
      const firstIndex = nextFlippedCards[0]
      const secondIndex = nextFlippedCards[1]

      if (cards[firstIndex] === cards[secondIndex]) {
        setMatchedCards([...matchedCards, firstIndex, secondIndex])
        setStreak(streak + 1)
        if (matchedCards.length + 2 === cards.length) {
          setTimerStarted(false)
          if (bestMoves === 0 || moves + 1 < bestMoves) {
            setBestMoves(moves + 1)
            localStorage.setItem(`flipFiestaBestMoves-${pairCount}`, String(moves + 1))
          }
        }
        if (matchedCards.length + 2 >= challengePairs * 2) {
          setBadgeEarned(true)
          localStorage.setItem('sprinkleBadge', 'true')
        }
        setFlippedCards([])
      } else {
        setStreak(0)
        setTimeout(() => {
          setFlippedCards([])
        }, 900)
      }
    }
  }


  function resetRound(symbols) {
    setFlippedCards([])
    setMatchedCards([])
    setMoves(0)
    setSeconds(0)
    setTimerStarted(false)
    setIsPaused(false)
    setShowHint(false)
    setStreak(0)
    setCards(shuffleCards([...symbols, ...symbols]))
  }

  function handleNewRound() {
    resetRound(cardSymbols.slice(0, pairCount))
  }

  function handleThemeChange(event) {
    const nextTheme = event.target.value
    setSelectedTheme(nextTheme)
    localStorage.setItem('flipFiestaTheme', nextTheme)
    resetRound(cardThemes[nextTheme].symbols.slice(0, pairCount))
  }

  function handleDifficultyChange(event) {
    const nextPairCount = Number(event.target.value)
    setPairCount(nextPairCount)
    localStorage.setItem('flipFiestaDifficulty', String(nextPairCount))
    setBestMoves(
      Number(localStorage.getItem(`flipFiestaBestMoves-${nextPairCount}`)) ||
        (nextPairCount === 8 ? Number(localStorage.getItem('flipFiestaBestMoves')) : 0)
    )
    resetRound(cardSymbols.slice(0, nextPairCount))
  }

  function handleResetProgress() {
    const confirmed = window.confirm(
      'Reset your sprinkle badge and best scores saved in this browser?'
    )

    if (!confirmed) {
      return
    }

    localStorage.removeItem('sprinkleBadge')
    localStorage.removeItem('flipFiestaBestMoves')

    for (const count of [2, 4, 8, 16, 32]) {
      localStorage.removeItem(`flipFiestaBestMoves-${count}`)
    }

    setBadgeEarned(false)
    setBestMoves(0)
    resetRound(cardSymbols.slice(0, pairCount))
  }

  return (
    <div className={`app-shell theme-${selectedTheme}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✿</span>
          Flip Fiesta
        </div>

        <p className="side-title">YOUR PLAY SPACE</p>

        <nav>
          <a className="nav-item" href="#play">🎮 <span>Play a round</span></a>
          <a className="nav-item" href="#collection">🧩 <span>Card collection</span></a>
          <a className="nav-item" href="#badges">🏆 <span>My badges</span></a>
        </nav>

        <div className="side-note">
          <strong>A tiny daily ritual ✨</strong>
          <p>Give your brain a playful little stretch.</p>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <span>YOUR COLORFUL CORNER / MEMORY GAME</span>
          <span>🌼 Guest player</span>
        </div>

        <header className="welcome">
          <div>
            <h1>Ready to match?</h1>
            <p>A little color. A little focus. A happy brain break.</p>
          </div>
          <span className="challenge-pill">🌟 TODAY'S LITTLE CHALLENGE</span>
        </header>

        <div className="game-layout">
          <section className="game-panel" id="play">
            <div className="game-heading">
              <div>
                <p className="game-label">THE {themeTitle.toUpperCase()} DECK</p>
                <h2>Find the matching pairs</h2>
              </div>
              <label className="deck-picker">
                <span>Choose a deck</span>
                <select
                  value={selectedTheme}
                  onChange={handleThemeChange}
                  disabled={showHint || isPaused}
                >
                  <option value="sweet">Sweet Shop</option>
                  <option value="garden">Garden Party</option>
                  <option value="ocean">Ocean Friends</option>
                  <option value="pink">Pink Paradise</option>
                </select>
              </label>
              <label className="deck-picker">
                <span>Difficulty</span>
                <select
                  value={pairCount}
                  onChange={handleDifficultyChange}
                  disabled={showHint || isPaused}
                >
                  <option value="2">Beginner · 2 pairs</option>
                  <option value="4">Easy · 4 pairs</option>
                  <option value="8">Medium · 8 pairs</option>
                  <option value="16">Tough · 16 pairs</option>
                  <option value="32">Extreme · 32 pairs</option>
                </select>
              </label>
            </div>

            <div className="stats-row">
              <div className="stat-item">Moves <strong>{moves}</strong></div>
              <div className="stat-item">Pairs <strong>{matchedCards.length / 2} / {cards.length / 2}</strong></div>
              <div className="stat-item">Streak <strong>{streak}</strong></div>
              <div className="stat-item">Best <strong>{bestMoves || '—'}</strong></div>
              <div className="stat-item">Time <strong>{seconds}s</strong></div>
            </div>

            <div className={`memory-board ${pairCount >= 16 ? 'large-board' : ''}`}>
              {cards.map((symbol, index) => (
                <button
                  className="memory-card"
                  key={index}
                  type="button"
                  onClick={() => handleCardClick(index)}
                  disabled={isPaused}
                  aria-label={
                    showHint || flippedCards.includes(index) || matchedCards.includes(index)
                      ? `Card showing ${symbol}`
                      : 'Hidden memory card'
                  }
                >
                  {showHint || flippedCards.includes(index) || matchedCards.includes(index)
                    ? symbol
                    : '✦'}
                </button>
              ))}
            </div>

            {isPaused && <p className="pause-note">Game paused — press Resume when you're ready.</p>}

            {matchedCards.length === cards.length && (
              <div className="win-banner" role="status">
                <span className="win-icon">🎉</span>
                <div>
                  <strong>Fiesta complete!</strong>
                  <p>You found {pairCount} pairs in {moves} moves and {seconds} seconds.</p>
                </div>
              </div>
            )}

            <div className="game-footer">
              <p>
                {matchedCards.length === cards.length
                  ? 'Ready for a fresh round?'
                  : 'Choose two cards to find a pair.'}
              </p>
              <div className="game-actions">
                <button
                  className="peek-button"
                  type="button"
                  onClick={handlePeekCards}
                  disabled={showHint || isPaused || matchedCards.length === cards.length}
                >
                  {showHint ? 'Cards showing…' : 'Peek cards'}
                </button>
                <button
                  className="pause-button"
                  type="button"
                  onClick={handlePauseToggle}
                  disabled={!timerStarted || showHint || flippedCards.length === 2 || matchedCards.length === cards.length}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  className="restart-button"
                  type="button"
                  onClick={handleNewRound}
                  disabled={showHint}
                >
                  New round
                </button>
              </div>
            </div>
          </section>

          <aside className="challenge-card">
            <p className="challenge-label">🌈 TODAY'S CHALLENGE</p>
            <h3>{themeTitle} streak</h3>
            <p>
              {badgeEarned
                ? 'You earned a sprinkle badge!'
                : `Find ${challengePairs} pairs to earn a sprinkle badge.`}
            </p>
            <div className="progress-track">
              <span
                style={{
                  width: `${badgeEarned ? 100 : Math.min((matchedCards.length / (challengePairs * 2)) * 100, 100)}%`,
                }}
              ></span>
            </div>
          </aside>
        </div>

        <section className="collection-section" id="collection">
          <p className="game-label">YOUR CARD COLLECTION</p>
          <h2>{themeTitle} cards</h2>
          <div className="collection-grid">
            {cardSymbols.map((symbol, index) => (
              <div className="collection-card" key={index}>
                <span>{symbol}</span>
                <p>{themeTitle} card {index + 1}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="collection-section" id="badges">
          <p className="game-label">YOUR LITTLE WINS</p>
          <h2>My badges</h2>
          <div className="badge-tile">
            <span className="badge-icon">🌈</span>
            <div>
              <h3>Sprinkle badge</h3>
              <p>
                {badgeEarned
                  ? `Earned! You matched ${challengePairs} pairs.`
                  : `Locked — match ${challengePairs} pairs to earn it.`}
              </p>
            </div>
          </div>
          <button
            className="reset-progress-button"
            type="button"
            onClick={handleResetProgress}
          >
            Reset progress
          </button>
        </section>
      </main>
    </div>
  )
}

export default App
