
// Fichier React - Vidéo Mesure avec repères visibles, cadres ajustables, bouton et mesures latérales

import React, { useRef, useState, useEffect } from 'react'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [message, setMessage] = useState("Initialisation de la caméra...")
  const [repères, setRepères] = useState([
    { id: 'r1', x: 30, y: 40, color: 'red' },
    { id: 'r2', x: 70, y: 40, color: 'red' },
    { id: 'w1', x: 25, y: 85, color: 'white' },
    { id: 'w2', x: 75, y: 85, color: 'white' }
  ])
  const [cadres, setCadres] = useState([
    { id: 'left', x: 20, y: 30, w: 20, h: 40 },
    { id: 'right', x: 60, y: 30, w: 20, h: 40 }
  ])
  const [dragId, setDragId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [result, setResult] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setTimeout(() => {
          videoRef.current.pause()
          setPaused(true)
          setMessage("Placez les repères et cadres.")
        }, 5000)
      }).catch(() => {
        setMessage("Caméra non accessible")
      })
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleMouseDown = (id, e) => {
    const bounds = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - bounds.left) / bounds.width * 100
    const y = (e.clientY - bounds.top) / bounds.height * 100
    const rep = repères.find(r => r.id === id)
    setDragId(id)
    setDragOffset({ x: x - rep.x, y: y - rep.y })
  }

  const handleMouseMove = (e) => {
    if (!dragId) return
    const bounds = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - bounds.left) / bounds.width * 100) - dragOffset.x
    const y = ((e.clientY - bounds.top) / bounds.height * 100) - dragOffset.y
    setRepères(repères.map(r => r.id === dragId ? { ...r, x, y } : r))
  }

  const handleMouseUp = () => setDragId(null)

  const handleCadreChange = (id, dx, dw) => {
    setCadres(cadres.map(c => c.id === id ? { ...c, x: c.x + dx, w: c.w + dw } : c))
  }

  const validerMesure = () => {
    const r1 = repères.find(r => r.id === 'r1')
    const r2 = repères.find(r => r.id === 'r2')
    const w1 = repères.find(r => r.id === 'w1')
    const w2 = repères.find(r => r.id === 'w2')
    const pxDistance = Math.hypot(w2.x - w1.x, w2.y - w1.y)
    const scale = 110 / pxDistance
    const leftCadre = cadres.find(c => c.id === 'left')
    const rightCadre = cadres.find(c => c.id === 'right')
    const center = (leftCadre.x + leftCadre.w + rightCadre.x) / 2

    const epd = Math.abs(r1.x - center) * scale
    const epg = Math.abs(r2.x - center) * scale
    setResult({ epd: epd.toFixed(1), epg: epg.toFixed(1), total: (epd + epg).toFixed(1) })
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ position: 'relative', width: '640px', maxWidth: '100%' }}
      >
        <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} muted playsInline />
        {paused && repères.map(r => (
          <div key={r.id}
            onMouseDown={(e) => handleMouseDown(r.id, e)}
            style={{
              position: 'absolute',
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: '30px',
              height: '30px',
              marginLeft: '-15px',
              marginTop: '-15px',
              borderRadius: '50%',
              border: `2px solid ${r.color}`,
              backgroundColor: 'transparent',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'grab',
              touchAction: 'none'
            }}
          >
            <div style={{
              width: '2px', height: '16px', backgroundColor: r.color, position: 'absolute'
            }} />
            <div style={{
              width: '16px', height: '2px', backgroundColor: r.color, position: 'absolute'
            }} />
          </div>
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
              resize: 'horizontal',
              overflow: 'auto',
              cursor: 'ew-resize'
            }}
          />
        ))}
      </div>
      <div style={{ marginLeft: '20px', width: '200px' }}>
        <button onClick={validerMesure} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Valider la mesure
        </button>
        {result && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <div><strong>EPD :</strong> {result.epd} mm</div>
            <div><strong>EPG :</strong> {result.epg} mm</div>
            <div><strong>Total :</strong> {result.total} mm</div>
          </div>
        )}
      </div>
    </div>
  )
}
