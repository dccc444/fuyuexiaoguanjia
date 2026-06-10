import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-main-v3 home-main-brand">
      <section className="hero-v3 hero-v3-brand">
        <div className="hero-copy-v3 hero-copy-brand">
          <p className="hero-kicker-v3 hero-kicker-brand">YOUR DATE STARTS HERE</p>
          <div className="hero-title-poster">
            <p className="hero-title-meta">RENDEZVOUS</p>
            <h1 className="hero-title-v3 hero-title-brand">
              <span>让奔赴，</span>
              <span className="hero-title-highlight">比想象更美好</span>
            </h1>
            <p className="hero-title-script">把心动，写在出发之前</p>
          </div>
          <p className="hero-subcopy-v3">
            给演唱会、音乐节和球赛准备的赴约小管家。
            你只管期待现场，我们帮你把计划、节奏、搭子和返程提前收好。
          </p>

          <div className="planner-actions-v3">
            <button className="hero-primary-v3" onClick={() => navigate('/planner')} type="button">
              进入模块
            </button>
            <button className="hero-secondary-v3" onClick={() => navigate('/buddy')} type="button">
              去找搭子
            </button>
          </div>
        </div>

        <div className="brand-visual-panel" aria-hidden="true">
          <img alt="" className="brand-visual-image" src="/hero-concert.jpg" />
          <div className="brand-visual-overlay" />
          <div className="brand-visual-copy">
            <span>演唱会 / 音乐节 / 球赛</span>
            <strong>让奔赴，比想象更美好。</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
