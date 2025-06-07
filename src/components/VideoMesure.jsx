import React, { useEffect, useRef, useState } from 'react'

export default function VideoMesure() {
  const videoRef = useRef(null)
  const [message, setMessage] = useState("Initialisation de la caméra...")
  const [flashSupported, setFlashSupported] = useState(null)

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
          videoRef.current.play()
        }

        setMessage("Mesure en cours (5 sec)...")

        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop())
          setMessage("Mesure terminée. À ajuster ou recommencer.")
        }, 5000)
      } catch (error) {
        console.error("Erreur caméra :", error)
        setMessage("Erreur : caméra inaccessible ou refusée.")
        setFlashSupported(false)
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
      <video ref={videoRef} style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }} muted playsInline></video>
    </div>
  )
}
