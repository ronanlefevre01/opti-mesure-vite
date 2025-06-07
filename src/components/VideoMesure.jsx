
// Version finale avec cadres redimensionnables, repères visibles, image ajustée et bouton de validation

import React, { useRef, useState, useEffect } from 'react'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [cadres, setCadres] = useState([
    { id: 'left', x: 20, y: 35, w: 25, h: 35 },
    { id: 'right', x: 55, y: 35, w: 25, h: 35 }
  ])
  const [repères, setRepères] = useState({
    rougeG: { x: 30, y: 50 },
    rougeD: { x: 70, y: 50 },
    blancG: { x: 25, y: 90 },
    blancD: { x: 75, y: 90 }
  })
  const [dragRepère, setDragRepère] = useState(null)
  const [centre, setCentre] = useState(null)
  const [message, setMessage] = useState("Initialisation caméra...")

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    async function initCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setTimeout(() => {
          videoRef.current.pause()
          setPaused(true)
          setMessage("Ajustez les cadres et repères.")
        }, 5000)
      } catch {
        setMessage("Caméra inaccessible")
      }
    }
    initCam()
    return () => document.body.style.overflow = ''
  }, [])

  const updateRepère = (e) => {
    if (!dragRepère) return
    const bounds = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX || e.touches[0].clientX) - bounds.left) / bounds.width * 100
    const y = ((e.clientY || e.touches[0].clientY) - bounds.top) / bounds.height * 100
    setRepères({ ...repères, [dragRepère]: { x, y } })
  }

  const handleCadreChange = (id, newData) => {
    setCadres(cadres.map(c => c.id === id ? { ...c, ...newData } : c))
  }

  const validerMesure = () => {
    const left = cadres.find(c => c.id === 'left')
    const right = cadres.find(c => c.id === 'right')
    const centreX = (left.x + left.w + right.x) / 2
    setCentre(centreX.toFixed(1))
    setMessage("Mesure validée")
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Mesure vidéo optique</h2>
      <p>{message}</p>
      <div
        ref={containerRef}
        onMouseMove={updateRepère}
        onTouchMove={updateRepère}
        onMouseUp={() => setDragRepère(null)}
        onTouchEnd={() => setDragRepère(null)}
        style={{ position: 'relative', maxWidth: '800px', margin: 'auto', height: 'auto' }}
      >
        <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} playsInline muted />
        {paused && Object.entries(repères).map(([key, pos]) => (
          <div key={key}
            onMouseDown={() => setDragRepère(key)}
            onTouchStart={() => setDragRepère(key)}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: 20,
              height: 20,
              backgroundColor: key.includes("rouge") ? 'red' : 'white',
              borderRadius: '50%',
              border: '2px solid black',
              transform: 'translate(-50%, -50%)',
              touchAction: 'none'
            }}
          />
        ))}
        {paused && cadres.map(c => (
          <div key={c.id}
            style={{
              position: 'absolute',
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.w}%`,
              height: `${c.h}%`,
              border: '2px solid yellow',
              resize: 'both',
              overflow: 'auto',
              touchAction: 'none'
            }}
            contentEditable
            onClick={() => {}}
          />
        ))}
      </div>
      <button onClick={validerMesure} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Valider la mesure
      </button>
      {centre && (
        <p style={{ marginTop: '10px' }}>Centre calculé : <strong>{centre}%</strong></p>
      )}
    </div>
  )
}
