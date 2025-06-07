
import React, { useEffect, useRef, useState } from 'react'
import './VideoMesure.css'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [message, setMessage] = useState("Initialisation de la caméra...")
  const [flashSupported, setFlashSupported] = useState(null)
  const [paused, setPaused] = useState(false)
  const [repères, setRepères] = useState([
    { id: 1, x: 40, y: 40 },
    { id: 2, x: 70, y: 40 }
  ])
  const [dragId, setDragId] = useState(null)

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
              setMessage("Mesure terminée. Placez les repères sur les pupilles.")
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

  const handleMouseDown = (id) => {
    setDragId(id)
  }

  const handleMouseUp = () => {
    setDragId(null)
  }

  const handleMouseMove = (e) => {
    if (dragId !== null && containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - bounds.left) / bounds.width) * 100
      const y = ((e.clientY - bounds.top) / bounds.height) * 100

      setRepères(reps => reps.map(r =>
        r.id === dragId ? { ...r, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : r
      ))
    }
  }

  return (
    <div>
      <h2>Module de mesure vidéo</h2>
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
          border: paused ? '3px dashed #2563eb' : '2px solid #ccc'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <video
          ref={videoRef}
          style={{ width: '100%', display: 'block', borderRadius: '8px' }}
          muted
          playsInline
        />
        {paused && repères.map(repère => (
          <div
            key={repère.id}
            onMouseDown={() => handleMouseDown(repère.id)}
            className="repere"
            style={{
              position: 'absolute',
              top: repère.y + '%',
              left: repère.x + '%',
              width: '40px',
              height: '40px',
              marginLeft: '-20px',
              marginTop: '-20px',
              border: '2px solid red',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,0,0,0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'grab'
            }}
          >
            <div style={{
              width: '2px',
              height: '20px',
              backgroundColor: 'red',
              position: 'absolute'
            }} />
            <div style={{
              width: '20px',
              height: '2px',
              backgroundColor: 'red',
              position: 'absolute'
            }} />
          </div>
        ))}
      </div>
    </div>
  )
}
