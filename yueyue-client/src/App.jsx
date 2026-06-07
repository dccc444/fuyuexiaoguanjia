import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CreatePlanPage } from './pages/CreatePlanPage'
import { BattleBookPage } from './pages/BattleBookPage'
import { MyTripsPage } from './pages/MyTripsPage'
import { SharedBattleBookPage } from './pages/SharedBattleBookPage'
import { MoneyManagerPage } from './pages/MoneyManagerPage'
import { MoneyCenterPage } from './pages/MoneyCenterPage'
import './styles/home-v3.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePlanPage />} />
        <Route path="/battle-books/:id" element={<BattleBookPage />} />
        <Route path="/money" element={<MoneyCenterPage />} />
        <Route path="/money/:id" element={<MoneyManagerPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/shared/:token" element={<SharedBattleBookPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
