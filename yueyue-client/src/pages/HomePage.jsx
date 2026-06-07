import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SceneCard } from '../components/SceneCard'
import { useBattleBooks } from '../hooks/useBattleBooks'
import { getTripMeta } from '../utils/tripMeta'

const concertModules = [
  '创建赴约计划',
  '穿搭与妆造',
  '周边餐饮补给',
  '住宿与拼房',
  '跨城交通与散场返程',
  '票务与座位提醒',
  '找搭子与物料互换',
]

const matchModules = [
  '创建观赛安排',
  '门票与看台提醒',
  '入场动线',
  '场内观赛指南',
  '散场夜宵与返程',
  '球迷圈与同城搭子',
]

const quickPrompts = [
  '第一次一个人去演唱会，帮我把应援、出片和散场返程都安排稳一点',
  '我想去音乐节看两个舞台，顺便找住得近一点的地方',
  '散场后要赶高铁，帮我把退场路线和上车节奏排清楚',
]

const scenes = [
  {
    key: 'concert',
    title: '演唱会赴约',
    accent: '应援 · 出片 · 返程',
    description: '把应援、入场、拍照和散场返程都理顺，现场就能更尽兴。',
  },
  {
    key: 'festival',
    title: '音乐节赴约',
    accent: '舞台 · 补给 · 体力',
    description: '从舞台切换、穿搭到补给，把热闹感和轻松感一起安排好。',
  },
  {
    key: 'match',
    title: '球赛赴约',
    accent: '看台 · 动线 · 氛围',
    description: '把看台、门票、入场口和散场路线提前想明白，看球更顺手。',
  },
]

const highlights = [
  {
    title: '更像追星助手，不是旅游工具',
    text: '我们优先考虑的是应援、出片、物料、搭子和散场返程，而不是泛泛的旅行攻略。',
  },
  {
    title: '先帮你查场馆规矩',
    text: '大场馆禁带、入口、寄存和返程提醒会优先前置，避免到了现场才手忙脚乱。',
  },
  {
    title: '把期待感也照顾进去',
    text: '不只是解决问题，还会顺手帮你把穿搭、拍照、应援节奏和当天氛围感安排得更好。',
  },
]

const carouselSlides = [
  {
    title: '演唱会赴约',
    subtitle: '应援、出片、入场和散场路线一页理顺，现场就能更专心见喜欢的人。',
    tone: 'rose',
    image: '/hero-concert.jpg',
    tags: ['应援物', '出片点', '散场返程'],
  },
  {
    title: '音乐节赴约',
    subtitle: '舞台切换、穿搭补给和住得近一点这三件事，提前想好就会舒服很多。',
    tone: 'mint',
    image: '/hero-festival.jpg',
    tags: ['舞台切换', '天气补给', '轻装感'],
  },
  {
    title: '球赛赴约',
    subtitle: '看台动线、进场节奏和赛后散场安排提前收好，氛围更满，心态更稳。',
    tone: 'amber',
    image: '/hero-match.jpg',
    tags: ['看台路线', '入场口', '赛后返程'],
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const { items, loading, error } = useBattleBooks()
  const [slideIndex, setSlideIndex] = useState(0)

  const recentTrips = items.slice(0, 3)
  const activeSlide = carouselSlides[slideIndex]

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return undefined

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      setSlideIndex((current) => (current + 1) % carouselSlides.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [])

  function jumpToSection(id) {
    const target = document.getElementById(id)
    if (!target) return

    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 24
    window.scrollTo({ top: offsetTop, behavior: 'smooth' })
  }

  return (
    <div className="home-layout home-v3">
      <aside className="home-sidebar-v3">
        <section className="sidebar-card">
          <p className="sidebar-title">演唱会 / 音乐节赴约</p>
          <div className="sidebar-stack">
            {concertModules.map((item, index) => (
              <button
                className={index === 0 ? 'sidebar-item active' : 'sidebar-item'}
                key={item}
                onClick={() => navigate('/create?scene=concert')}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-card sidebar-card-amber">
          <p className="sidebar-title">球赛赴约</p>
          <div className="sidebar-stack">
            {matchModules.map((item, index) => (
              <button
                className={index === 0 ? 'sidebar-item sidebar-item-amber active' : 'sidebar-item sidebar-item-amber'}
                key={item}
                onClick={() => navigate('/create?scene=match')}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="sidebar-card sidebar-card-soft">
          <p className="sidebar-title">快速看看</p>
          <div className="sidebar-stack">
            <button className="sidebar-link-button" onClick={() => jumpToSection('hero')} type="button">
              先从首页开始
            </button>
            <button className="sidebar-link-button" onClick={() => jumpToSection('carousel')} type="button">
              看看现场氛围
            </button>
            <button className="sidebar-link-button" onClick={() => jumpToSection('prompts')} type="button">
              套用推荐问题
            </button>
            <button className="sidebar-link-button" onClick={() => jumpToSection('recent')} type="button">
              回到我的安排
            </button>
          </div>
        </section>
      </aside>

      <div className="home-main-v3">
        <section className="hero-v3" id="hero">
          <div className="hero-copy-v3">
            <div className="hero-tabs-v3">
              <span className="hero-tab active">赴约计划</span>
              <span className="hero-tab">应援提醒</span>
              <span className="hero-tab">出片安排</span>
              <span className="hero-tab">散场返程</span>
            </div>

            <p className="hero-kicker-v3">Your date starts here</p>
            <h1 className="hero-title-v3">
              <span>把这场见面</span>
              <span className="hero-title-highlight">安排得浪漫一点</span>
              <span>也安心一点</span>
            </h1>
            <p className="hero-subcopy-v3">这不是普通旅行规划，而是给演唱会、音乐节和球赛做的赴约小管家。我们会把应援、场馆规则、拍照、搭子、物料和散场返程都提前替你想好。</p>

            <div className="hero-chip-row-v3">
              <span className="hero-chip-v3">追星助手</span>
              <span className="hero-chip-v3">AI 生成赴约手册</span>
              <span className="hero-chip-v3">场馆规则 + 时间线 + 清单</span>
            </div>
          </div>

          <div className="planner-card-v3">
            <div className="planner-head-v3">
              <div>
                <p className="planner-kicker-v3">追现场规划</p>
                <h2>先把这次赴约想清楚</h2>
              </div>
              <span className="planner-badge-v3">追星特化</span>
            </div>

            <div className="planner-grid-v3">
              <button className="planner-input-v3 planner-input-wide" onClick={() => navigate('/create')} type="button">
                <span>这次去看谁 / 看什么</span>
                <strong>演唱会、音乐节、球赛都可以</strong>
              </button>
              <button className="planner-input-v3" onClick={() => navigate('/create?scene=concert')} type="button">
                <span>演唱会 / 音乐节</span>
                <strong>应援、出片、物料、搭子</strong>
              </button>
              <button className="planner-input-v3" onClick={() => navigate('/create?scene=match')} type="button">
                <span>球赛</span>
                <strong>看台、进场、氛围、返程</strong>
              </button>
              <button className="planner-input-v3 planner-input-wide" onClick={() => navigate('/create')} type="button">
                <span>你最在意什么</span>
                <strong>散场赶车 / 想拍照 / 想找搭子 / 第一次去 / 想省心</strong>
              </button>
            </div>

            <div className="planner-actions-v3">
              <button className="hero-primary-v3" onClick={() => navigate('/create')} type="button">
                立即创建赴约计划
              </button>
              <button className="hero-secondary-v3" onClick={() => navigate('/my-trips')} type="button">
                打开我的安排
              </button>
            </div>

            <div className="planner-mini-points">
              <span>先看场馆规矩</span>
              <span>再排应援节奏</span>
              <span>最后收好返程</span>
            </div>
          </div>
        </section>

        <section className="carousel-strip-v3" id="carousel">
          <article className={`carousel-card-v3 tone-${activeSlide.tone}`}>
            <div className="carousel-copy-v3">
              <p className="carousel-kicker-v3">现场氛围</p>
              <h3>{activeSlide.title}</h3>
              <p>{activeSlide.subtitle}</p>
              <div className="carousel-chip-row-v3">
                {activeSlide.tags.map((tag) => (
                  <span className="carousel-chip-v3" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="carousel-stage-v3">
              <img alt={activeSlide.title} className="carousel-image-v3" src={activeSlide.image} />
              <div className="carousel-overlay-v3" />
              <div className="carousel-caption-v3">
                <span className="carousel-badge-v3">赴约气氛</span>
                <strong>{activeSlide.title}</strong>
                <p>{activeSlide.subtitle}</p>
              </div>
            </div>
          </article>

          <div className="carousel-dots-v3">
            {carouselSlides.map((slide, index) => (
              <button
                aria-label={slide.title}
                className={index === slideIndex ? 'carousel-dot-v3 active' : 'carousel-dot-v3'}
                key={slide.title}
                onClick={() => setSlideIndex(index)}
                type="button"
              />
            ))}
          </div>
        </section>

        <section className="panel-v3 panel-v3-light" id="prompts">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">不知道怎么开口</p>
              <h2>这些问题最适合直接丢给赴约小管家</h2>
            </div>
          </div>

          <div className="prompt-grid-v3">
            {quickPrompts.map((prompt, index) => (
              <button
                className={`prompt-card-v3 prompt-tone-${(index % 3) + 1}`}
                key={prompt}
                onClick={() => navigate('/create')}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <section className="scene-section-v3">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">按场景开始</p>
              <h2>先选这次赴约的现场，再进入细节安排</h2>
            </div>
          </div>

          <div className="scene-grid">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.key}
                title={scene.title}
                accent={scene.accent}
                description={scene.description}
                onClick={() => navigate(`/create?scene=${scene.key}`)}
              />
            ))}
          </div>
        </section>

        <section className="highlight-grid-v3">
          {highlights.map((item, index) => (
            <article className={`panel-v3 highlight-card-v3 highlight-tone-${(index % 3) + 1}`} key={item.title}>
              <p className="section-kicker-v3">Why it feels better</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="panel-v3 panel-v3-light home-money-entry-card">
          <div className="home-money-entry-copy">
            <p className="section-kicker-v3">预算管家 / 记账分账</p>
            <h2>把总预算、现场支出和 AA 清单单独管起来</h2>
            <p>先定总预算，现场每一笔票务、交通、住宿、餐饮和物料都能直接记。散场后系统会自动给出谁转给谁的结算清单。</p>
            <div className="hero-chip-row-v3 home-money-chip-row">
              <span className="hero-chip-v3">总预算拆分</span>
              <span className="hero-chip-v3">现场即时记账</span>
              <span className="hero-chip-v3">AA 自动结算</span>
            </div>
          </div>
          <div className="home-money-entry-side">
            <button className="hero-primary-v3" onClick={() => navigate('/money')} type="button">
              打开记账分账
            </button>
            <button className="hero-secondary-v3" onClick={() => navigate('/create')} type="button">
              先建一场赴约
            </button>
          </div>
        </section>

        <section className="panel-v3 panel-v3-light" id="recent">
          <div className="section-head-v3">
            <div>
              <p className="section-kicker-v3">最近安排</p>
              <h2>继续看看你已经准备过的赴约手册</h2>
            </div>
            <button className="hero-secondary-v3 compact" onClick={() => navigate('/my-trips')} type="button">
              全部查看
            </button>
          </div>

          {loading ? <p className="empty-state-v3">正在整理你最近的安排...</p> : null}
          {!loading && error ? <p className="empty-state-v3">最近安排暂时没加载出来，稍后再回来看看。</p> : null}
          {!loading && !error && recentTrips.length === 0 ? (
            <p className="empty-state-v3">这里还没有内容。先生成第一份赴约手册，后面我们再把它升级成当天随身页。</p>
          ) : null}

          {!loading && !error && recentTrips.length > 0 ? (
            <div className="trip-grid">
              {recentTrips.map((trip) => {
                const meta = getTripMeta(trip)

                return (
                  <button
                    className="trip-card-v3"
                    key={trip.id}
                    onClick={() => navigate(`/battle-books/${trip.id}`)}
                    type="button"
                  >
                    <span className="trip-tag-v3">{meta.sceneLabel}</span>
                    <strong>{meta.eventName}</strong>
                    <p>
                      {meta.city} · {meta.venue}
                    </p>
                    <span>{meta.eventDate}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
