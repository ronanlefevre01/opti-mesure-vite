
import React, { useEffect, useRef, useState } from 'react'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [message, setMessage] = useState("Initialisation de la caméra...")
  const [flashSupported, setFlashSupported] = useState(null)
  const [showCanvas, setShowCanvas] = useState(false)

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
              captureFrame()
              setMessage("Mesure terminée. Vous pouvez placer les repères.")
              setShowCanvas(true)
            }, 5000)
          }
        }
      } catch (error) {
        console.error("Erreur caméra :", error)
        setMessage("Erreur : caméra inaccessible ou refusée.")
        setFlashSupported(false)
      }
    }

    function captureFrame() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        video.srcObject.getTracks().forEach(track => track.stop())
      } else {
        setMessage("Erreur de capture : image non disponible.")
      }
    }

    startCamera()
  }, [])

  return (
    <div>
      <h2>Module de mesure vidéo</h2>
      <p>{message}</p>
      {flashSupported === false && (
        <p style={{ color: 'orange', fontWeight: 'bold' }}>
          Activez manuellement le flash de votre appareil pour améliorer la mesure.
        </p>
      )}
      <div style={{ position: 'relative', maxWidth: '100%', margin: 'auto' }}>
        {!showCanvas && (
          <video
            ref={videoRef}
            style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '2px solid #ccc' }}
            muted
            playsInline
          />
        )}
        {showCanvas && (
          <canvas
            ref={canvasRef}
            style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', border: '2px dashed #2563eb' }}
          />
        )}
      </div>
    </div>
  )
}
