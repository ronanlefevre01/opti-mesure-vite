
import React, { useEffect, useRef, useState } from 'react'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [message, setMessage] = useState("Initialisation de la caméra...")
  const [flashSupported, setFlashSupported] = useState(null)
  const [paused, setPaused] = useState(false)
  const [repères, setRepères] = useState([
    { id: 'r1', x: 40, y: 45, color: 'red' },
    { id: 'r2', x: 60, y: 45, color: 'red' },
    { id: 'w1', x: 30, y: 60, color: 'white' },
    { id: 'w2', x: 70, y: 60, color: 'white' }
  ])
  const [dragId, setDragId] = useState(null)
  const [curseurX, setCurseurX] = useState(50)
  const [dragCurseur, setDragCurseur] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities?.()

        if (capabilities?.torch) {
          setFlashSupported(true)
          await track.applyConstraints({ advanced: [{ torch: true }] })
        } else {
          setFlashSupported(false)
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            setMessage("Mesure en cours (5 sec)...")

            setTimeout(() => {
              videoRef.current.pause()
              setMessage("Placez les repères et ajustez le curseur vertical.")
              setPaused(true)
            }, 5000)
          }
        }
      } catch (error) {
        console.error("Erreur caméra :", error)
        setMessage("Erreur : caméra inaccessible ou refusée.")
        setFlashSupported(false)
      }
    }

    startCamera()
  }, [])

  const updatePosition = (clientX, clientY) => {
    if (!containerRef.current) return
    const bounds = containerRef.current.getBoundingClientRect()
    const x = ((clientX - bounds.left) / bounds.width) * 100
    const y = ((clientY - bounds.top) / bounds.height) * 100

    if (dragCurseur) {
      setCurseurX(Math.max(0, Math.min(100, x)))
    } else if (dragId !== null) {
      setRepères(reps => reps.map(r =>
        r.id === dragId ? { ...r, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : r
      ))
    }
  }

  const handleMouseDown = (id) => setDragId(id)
  const handleMouseUp = () => {
    setDragId(null)
    setDragCurseur(false)
  }
  const handleMouseMove = (e) => updatePosition(e.clientX, e.clientY)
  const handleTouchStart = (id) => setDragId(id)
  const handleTouchMove = (e) => {
    if (e.touches.length > 0) updatePosition(e.touches[0].clientX, e.touches[0].clientY)
  }
  const handleTouchEnd = () => {
    setDragId(null)
    setDragCurseur(false)
  }

  const validerMesure = () => {
    if (!containerRef.current) return
    const bounds = containerRef.current.getBoundingClientRect()
    const getPx = (r) => ({
      x: (r.x / 100) * bounds.width,
      y: (r.y / 100) * bounds.height
    })

    const r1 = getPx(repères.find(r => r.id === 'r1'))
    const r2 = getPx(repères.find(r => r.id === 'r2'))
    const w1 = getPx(repères.find(r => r.id === 'w1'))
    const w2 = getPx(repères.find(r => r.id === 'w2'))
    const cX = (curseurX / 100) * bounds.width

    const scale = 110 / Math.hypot(w2.x - w1.x, w2.y - w1.y)
    const epd = Math.abs(r1.x - cX) * scale
    const epg = Math.abs(r2.x - cX) * scale

    setResult(`EPD = ${epd.toFixed(1)} mm — EPG = ${epg.toFixed(1)} mm — Total = ${(epd + epg).toFixed(1)} mm`)
  }

  return (
    <div>
      <h2>Mesure avec curseur central</h2>
      <p>{message}</p>
      {flashSupported === false && (
        <p style={{ color: 'orange', fontWeight: 'bold' }}>
          Activez manuellement le flash de votre appareil pour améliorer la mesure.
        </p>
      )}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
          margin: 'auto',
          borderRadius: '8px',
          border: paused ? '3px dashed #2563eb' : '2px solid #ccc',
          height: 'auto'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', display: 'block', borderRadius: '8px' }}
          muted
          playsInline
        />
        {paused && (
          <div
            onMouseDown={() => setDragCurseur(true)}
            onTouchStart={() => setDragCurseur(true)}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: curseurX + '%',
              width: '2px',
              backgroundColor: 'blue',
              zIndex: 5
            }}
          />
        )}
        {paused && repères.map(repère => (
          <div
            key={repère.id}
            onMouseDown={() => handleMouseDown(repère.id)}
            onTouchStart={() => handleTouchStart(repère.id)}
            style={{
              position: 'absolute',
              top: repère.y + '%',
              left: repère.x + '%',
              width: '40px',
              height: '40px',
              marginLeft: '-20px',
              marginTop: '-20px',
              border: `2px solid ${repère.color}`,
              borderRadius: '50%',
              backgroundColor: repère.color === 'white' ? 'rgba(255,255,255,0.8)' : 'rgba(255,0,0,0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'grab',
              touchAction: 'none'
            }}
          >
            <div style={{
              width: '2px',
              height: '20px',
              backgroundColor: repère.color,
              position: 'absolute'
            }} />
            <div style={{
              width: '20px',
              height: '2px',
              backgroundColor: repère.color,
              position: 'absolute'
            }} />
          </div>
        ))}
      </div>
      {paused && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={validerMesure} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Valider la mesure
          </button>
          {result && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{result}</p>}
        </div>
      )}
    </div>
  )
}
