// src/components/NovaCategoria.jsx
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function NovaCategoria() {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');

    const usuario = auth.currentUser;
    if (!usuario) {
      setErro('Usuário não autenticado.');
      return;
    }

    if (!nome.trim()) {
      setErro('O nome da categoria é obrigatório.');
      return;
    }

    try {
      await addDoc(collection(db, 'categorias'), {
        nome: nome.trim(),
        uid: usuario.uid,
        criadoEm: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (err) {
      setErro('Erro ao salvar categoria: ' + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSalvar} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Nova Categoria</h2>

        <input
          type="text"
          placeholder="Nome da categoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        {erro && <p className="text-red-500 mb-4">{erro}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600"
        >
          Salvar Categoria
        </button>
      </form>
    </div>
  );
}

export default NovaCategoria;
