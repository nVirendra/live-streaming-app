import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/common/Header';
import Home from './pages/Home';
 import Login from './pages/Login';
import Register from './pages/Register';
// import StreamView from './pages/StreamView';
import Broadcast from './pages/Broadcast';
// import Profile from './pages/Profile';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
       <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/register" element={<Register />} />
                 <Route 
                  path="/broadcast" 
                  element={
                    <ProtectedRoute>
                      <Broadcast />
                    </ProtectedRoute>
                  } 
                />

                 {/* <Route path="/stream/:id" element={<StreamView />} /> */} 
                {/* <Route 
                  path="/broadcast" 
                  element={
                    <ProtectedRoute>
                      <Broadcast />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                /> */}
              </Routes>
            </main>
          </div>
        </Router>
    </SocketProvider> 
     </AuthProvider>
  );
}

export default App;