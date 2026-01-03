// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import AuthProvider from './context/AuthContext'
// import RenderProvider from './context/RenderContext.jsx'
// import ChatProvider from './context/ChatContext.jsx'
// import { BrowserRouter } from 'react-router-dom'



// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <RenderProvider>
//       <BrowserRouter>
//         <AuthProvider>
//           <ChatProvider>
//             <App />
//           </ChatProvider>
//         </AuthProvider>
//       </BrowserRouter>
//     </RenderProvider>
//   </StrictMode>,
// )
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext'
// CHANGE THIS: Remove .jsx to match your other imports
import RenderProvider from './context/RenderContext' 
import ChatProvider from './context/ChatContext' // Remove .jsx here too for consistency
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RenderProvider>
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </RenderProvider>
  </StrictMode>,
)