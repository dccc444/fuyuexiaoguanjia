export function SceneCard({ title, description, accent, onClick }) {
  return (
    <button className="scene-card scenic-card" onClick={onClick} type="button">
      <div className="scene-card-top">
        <span className="scene-card-accent">{accent}</span>
        <span className="scene-card-arrow">→</span>
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
      <span className="scene-card-action">从这里开始安排</span>
    </button>
  )
}
