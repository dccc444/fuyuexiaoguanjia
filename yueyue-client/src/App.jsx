import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { BattleBookPage } from './pages/BattleBookPage'
import { MyTripsPage } from './pages/MyTripsPage'
import { SharedBattleBookPage } from './pages/SharedBattleBookPage'
import { MoneyManagerPage } from './pages/MoneyManagerPage'
import { MoneyCenterPage } from './pages/MoneyCenterPage'
import { AdminPage } from './pages/AdminPage'
import { PlannerWorkspacePage } from './pages/PlannerWorkspacePage'
import { BasicModulePage } from './pages/planner/BasicModulePage'
import { RulesModulePage } from './pages/planner/RulesModulePage'
import { TravelModulePage } from './pages/planner/TravelModulePage'
import { TicketModulePage } from './pages/planner/TicketModulePage'
import { SocialModulePage } from './pages/planner/SocialModulePage'
import { BuddySquarePage } from './pages/BuddySquarePage'
import { BuddyPublishPage } from './pages/BuddyPublishPage'
import { BuddyDetailPage } from './pages/BuddyDetailPage'
import { MyBuddyPostsPage } from './pages/MyBuddyPostsPage'
import './styles/home-v3.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<Navigate to="/planner" replace />} />
        <Route path="/planner" element={<PlannerWorkspacePage />}>
          <Route index element={<BasicModulePage />} />
          <Route path="basic" element={<BasicModulePage />} />
          <Route path="rules" element={<RulesModulePage />} />
          <Route path="travel" element={<TravelModulePage />} />
          <Route path="ticket" element={<TicketModulePage />} />
          <Route path="social" element={<SocialModulePage />} />
        </Route>
        <Route path="/buddy" element={<BuddySquarePage />} />
        <Route path="/buddy/new" element={<BuddyPublishPage />} />
        <Route path="/buddy/:id/edit" element={<BuddyPublishPage />} />
        <Route path="/buddy/:id" element={<BuddyDetailPage />} />
        <Route path="/my-buddy-posts" element={<MyBuddyPostsPage />} />
        <Route path="/battle-books/:id" element={<BattleBookPage />} />
        <Route path="/money" element={<MoneyCenterPage />} />
        <Route path="/money/:id" element={<MoneyManagerPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/shared/:token" element={<SharedBattleBookPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
