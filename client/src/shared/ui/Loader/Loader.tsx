import './Loader.scss'

interface LoaderProps {
  fullscreen?: boolean
}

export function Loader({ fullscreen = false }: LoaderProps) {
  return (
    <div className={`loader${fullscreen ? ' loader--fullscreen' : ''}`}>
      <div className="loader__spinner">
        <span className="loader__ring"></span>
        <span className="loader__dot"></span>
      </div>
      <div className="loader__brand">
        Sub<b>Manager</b>
      </div>
    </div>
  )
}
