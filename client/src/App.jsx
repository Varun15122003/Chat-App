import './App.css'
import Routers from './Routers'
// 🟢 1. Import Global Call UI
import GlobalCallUI from './components/GlobalCallUI'
// 🟢 2. Import Auth Context (Taaki login hone ke baad hi Call UI dikhe)
import { useAuthContext } from './context/AuthContext'

function App() {
  const { user } = useAuthContext(); 

  return (
    <div>
      {/* 🟢 3. Add GlobalCallUI here */}
      {/* Ye check karega: Agar user logged in hai, tabhi Call System active hoga */}
      {user && <GlobalCallUI />}
      
      <Routers />
    </div>
  )
}

export default App