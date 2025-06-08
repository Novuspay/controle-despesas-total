// src/components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu lateral */}
      <aside className="w-64 bg-white shadow-md p-6 hidden sm:block">
        <h1 className="text-2xl font-bold mb-8 text-green-600">Controle de Gastos</h1>
        <nav className="flex flex-col gap-4">
          <Link to="/dashboard" className="text-gray-700 hover:text-green-600 font-medium">Dashboard</Link>
          <Link to="/nova" className="text-gray-700 hover:text-green-600 font-medium">Nova Transação</Link>
          <Link to="/relatorios" className="text-gray-700 hover:text-green-600 font-medium">Relatórios</Link>
          <Link to="/" onClick={() => auth.signOut()} className="text-red-500 hover:text-red-700 font-medium mt-4">Sair</Link>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Bem-vindo, {auth.currentUser?.email}</h2>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
