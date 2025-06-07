
// Fichier simplifié : structure pour deux cadres ajustables avec calcul automatique du centre
// Version fonctionnelle complète à intégrer dans l'application React (src/components/VideoMesure.jsx)

import React, { useRef, useState, useEffect } from 'react'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [message, setMessage] = useState("Initialisation de la caméra...")
  const [paused, setPaused] = useState(false)
  const [cadres, setCadres] = useState([
    { id: 'left', x: 20, y: 35, w: 20, h: 30 },
    { id: 'right', x: 60, y: 35, w: 20, h: 30 }
  ])
  const [drag, setDrag] = useState({ id: null, offsetX: 0, offsetY: 0 })
  const [centre, setCentre] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    async function initCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setMessage("Mesure en cours (5 sec)...")
        setTimeout(() => {
          videoRef.current.pause()
          setPaused(true)
          setMessage("Ajustez les cadres sur les verres.")
        }, 5000)
      } catch {
        setMessage("Caméra inaccessible")
      }
    }
    initCam()
    return () => document.body.style.overflow = ''
  }, [])

  const updatePosition = (e, id) => {
    const bounds = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX || e.touches[0].clientX) - bounds.left) / bounds.width * 100 - drag.offsetX
    const y = ((e.clientY || e.touches[0].clientY) - bounds.top) / bounds.height * 100 - drag.offsetY
    setCadres(cadres.map(c => c.id === id ? { ...c, x, y } : c))
  }

  const handleMouseDown = (e, id) => {
    const box = cadres.find(c => c.id === id)
    const bounds = containerRef.current.getBoundingClientRect()
    const offsetX = ((e.clientX - bounds.left) / bounds.width * 100) - box.x
    const offsetY = ((e.clientY - bounds.top) / bounds.height * 100) - box.y
    setDrag({ id, offsetX, offsetY })
  }

  const handleMouseUp = () => {
    setDrag({ id: null, offsetX: 0, offsetY: 0 })
    if (cadres.length === 2) {
      const left = cadres.find(c => c.id === 'left')
      const right = cadres.find(c => c.id === 'right')
      const centreX = (left.x + left.w + right.x) / 2
      setCentre(centreX.toFixed(1))
    }
  }

  return (
    <div>
      <h2>Mesure avec cadres verres</h2>
      <p>{message}</p>
      <div
        ref={containerRef}
        style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: 'auto' }}
        onMouseMove={(e) => drag.id && updatePosition(e, drag.id)}
        onMouseUp={handleMouseUp}
        onTouchMove={(e) => drag.id && updatePosition(e, drag.id)}
        onTouchEnd={handleMouseUp}
      >
        <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} playsInline muted />
        {paused && cadres.map(c => (
          <div key={c.id}
            onMouseDown={(e) => handleMouseDown(e, c.id)}
            onTouchStart={(e) => handleMouseDown(e, c.id)}
            style={{
              position: 'absolute',
              left: c.x + '%',
              top: c.y + '%',
              width: c.w + '%',
              height: c.h + '%',
              border: '2px solid yellow',
              borderRadius: '8px',
              touchAction: 'none',
              cursor: 'move'
            }}
          />
        ))}
        {paused && centre && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: centre + '%',
            width: '2px',
            height: '100%',
            backgroundColor: 'blue'
          }} />
        )}
      </div>
      {centre && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <strong>Centre calculé : </strong> {centre} %
        </div>
      )}
    </div>
  )
}
