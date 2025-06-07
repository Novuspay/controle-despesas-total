// src/components/Categorias.jsx
import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function Categorias() {
  const [nome, setNome] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');

  const carregarCategorias = async () => {
    const snapshot = await getDocs(collection(db, 'categorias'));
    const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCategorias(lista);
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleAdicionar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Digite um nome válido.');
      return;
    }

    try {
      await addDoc(collection(db, 'categorias'), { nome: nome.trim() });
      setNome('');
      carregarCategorias();
    } catch (err) {
      setErro('Erro ao adicionar: ' + err.message);
    }
  };

  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, 'categorias', id));
      carregarCategorias();
    } catch (err) {
      setErro('Erro ao excluir: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Categorias</h2>

        <form onSubmit={handleAdicionar} className="mb-4">
          <input
            type="text"
            placeholder="Nova categoria"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          {erro && <p className="text-red-500 mb-2">{erro}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            Adicionar
          </button>
        </form>

        <h3 className="text-lg font-semibold mb-2">Categorias Existentes</h3>
        <ul className="divide-y divide-gray-200">
          {categorias.map((cat) => (
            <li key={cat.id} className="flex justify-between items-center py-2">
              <span>{cat.nome}</span>
              <button
                onClick={() => handleExcluir(cat.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Categorias;
