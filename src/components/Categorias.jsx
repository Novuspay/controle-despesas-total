// src/components/Categorias.jsx
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Categorias() {
  const [categorias, setCategorias] = useState({ entrada: [], saida: [] });
  const [erro, setErro] = useState('');

  const carregarCategorias = async () => {
    setErro('');
    const usuario = auth.currentUser;
    if (!usuario) return;

    try {
      const snapshot = await getDocs(collection(db, 'categorias'));
      const todas = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((cat) => cat.uid === usuario.uid);

      const entrada = todas.filter((cat) => cat.tipo === 'entrada');
      const saida = todas.filter((cat) => cat.tipo === 'saida');

      setCategorias({ entrada, saida });
    } catch (err) {
      setErro('Erro ao carregar categorias: ' + err.message);
    }
  };

  const excluirCategoria = async (id) => {
    if (!window.confirm('Deseja excluir esta categoria?')) return;
    try {
      await deleteDoc(doc(db, 'categorias', id));
      carregarCategorias();
    } catch (err) {
      setErro('Erro ao excluir: ' + err.message);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Categorias</h1>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-green-700">Entradas</h2>
        <ul className="space-y-2">
          {categorias.entrada.map((cat) => (
            <li key={cat.id} className="flex justify-between items-center bg-green-50 p-2 rounded">
              <span>{cat.nome}</span>
              <button
                onClick={() => excluirCategoria(cat.id)}
                className="bg-red-200 text-red-700 px-2 py-1 rounded hover:bg-red-300"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2 text-red-700">Saídas</h2>
        <ul className="space-y-2">
          {categorias.saida.map((cat) => (
            <li key={cat.id} className="flex justify-between items-center bg-red-50 p-2 rounded">
              <span>{cat.nome}</span>
              <button
                onClick={() => excluirCategoria(cat.id)}
                className="bg-red-200 text-red-700 px-2 py-1 rounded hover:bg-red-300"
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
