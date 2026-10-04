import { Route, Routes } from 'react-router-dom'
import TopNav from './components/TopNav.jsx'
import Admin from './pages/Admin.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Mine from './pages/Mine.jsx'
import PetDetail from './pages/PetDetail.jsx'
import PostDetail from './pages/PostDetail.jsx'
import Publish from './pages/Publish.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/mine" element={<Mine />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <div className="empty">
                <span className="empty-emoji">🙈</span>
                页面走丢了
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        宠物星球 PetPlanet · React + FastAPI + MySQL 演示项目
      </footer>
    </div>
  )
}
