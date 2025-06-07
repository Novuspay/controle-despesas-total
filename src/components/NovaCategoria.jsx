// src/components/NovaCategoria.jsx
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function NovaCategoria() {
  const [nomeCategoria, setNomeCategoria] = useState('');
  const [tipoCategoria, setTipoCategoria] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSalvarCategoria = async (e) => {
    e.preventDefault();
    setErro('');

    const usuario = auth.currentUser;
    if (!usuario) {
      setErro('Usuário não autenticado.');
      return;
    }

    if (!nomeCategoria.trim() || !tipoCategoria.trim()) {
      setErro('Preencha todos os campos corretamente.');
      return;
    }

    try {
      await addDoc(collection(db, 'categorias'), {
        nome: nomeCategoria,
        tipo: tipoCategoria,
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
      <form onSubmit={handleSalvarCategoria} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Nova Categoria</h2>

        <input
          type="text"
          placeholder="Nome da Categoria"
          value={nomeCategoria}
          onChange={(e) => setNomeCategoria(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <select
          value={tipoCategoria}
          onChange={(e) => setTipoCategoria(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        >
          <option value="">Selecione o tipo</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

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
