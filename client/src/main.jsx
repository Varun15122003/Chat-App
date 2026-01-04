import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext'
import RenderProvider from './context/RenderContext' 
import ChatProvider from './context/ChatContext'
// 🟢 Import VideoProvider
import { VideoProvider } from './context/VideoContext' 
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RenderProvider>
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            {/* 🟢 VideoProvider ko ChatProvider ke ANDAR rakhein */}
            <VideoProvider>
              <App />
            </VideoProvider>
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </RenderProvider>
  </StrictMode>,
)