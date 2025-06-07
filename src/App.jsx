import React, { useState } from 'react'
import VideoMesure from './components/VideoMesure'

export default function App() {
  const [mode, setMode] = useState("home")

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      {mode === "home" && (
        <>
          <h1>Bienvenue dans OptiMesure</h1>
          <button style={{ fontSize: '1.2rem', padding: '1rem 2rem', marginTop: '2rem' }} onClick={() => setMode("video")}>
            Lancer la mesure vidéo
          </button>
        </>
      )}
      {mode === "video" && <VideoMesure />}
    </div>
  )
}
