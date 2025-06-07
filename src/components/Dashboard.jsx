import React, { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
        <h1 className="text-3xl font-bold mb-2">Olá, {usuario?.email || 'Usuário'} 👋</h1>
        <p className="text-gray-600 mb-6">Bem-vindo ao seu painel de controle</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
            <h2 className="font-semibold">Entradas</h2>
            <p className="text-xl font-bold">R$ 4.200,00</p>
          </div>
          <div className="bg-red-100 text-red-800 p-4 rounded shadow">
            <h2 className="font-semibold">Saídas</h2>
            <p className="text-xl font-bold">R$ 2.750,00</p>
          </div>
          <div className="bg-green-100 text-green-800 p-4 rounded shadow">
            <h2 className="font-semibold">Saldo Atual</h2>
            <p className="text-xl font-bold">R$ 1.450,00</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
