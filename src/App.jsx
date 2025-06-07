// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import NovaTransacao from './components/NovaTransacao';
import NovaCategoria from './components/NovaCategoria'; // ✅ nova importação
import Categorias from './components/Categorias';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nova" element={<NovaTransacao />} />
        <Route path="/categoria" element={<NovaCategoria />} /> {/* ✅ nova rota */}
        <Route path="/categorias" element={<Categorias />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
