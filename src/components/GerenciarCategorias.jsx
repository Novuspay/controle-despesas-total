import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

function GerenciarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [tipoCategoria, setTipoCategoria] = useState('entrada');

  useEffect(() => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const q = query(collection(db, 'categorias'), where('uid', '==', usuario.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategorias(lista);
    });

    return () => unsubscribe();
  }, []);

  const adicionarCategoria = async () => {
    const usuario = auth.currentUser;
    if (!usuario || !novaCategoria || !tipoCategoria) return;

    try {
      await addDoc(collection(db, 'categorias'), {
        nome: novaCategoria,
        tipo: tipoCategoria,
        uid: usuario.uid
      });
      setNovaCategoria('');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const excluirCategoria = async (id) => {
    try {
      await deleteDoc(doc(db, 'categorias', id));
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-indigo-700 mb-4">🎯 Gerenciar Categorias</h2>

      <div className="flex gap-2 mb-4">
        <select
          value={tipoCategoria}
          onChange={(e) => setTipoCategoria(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <input
          type="text"
          placeholder="Nome da categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="border rounded px-3 py-1 w-full"
        />
        <button
          onClick={adicionarCategoria}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        >
          Adicionar
        </button>
      </div>

      <ul className="text-sm divide-y">
        {categorias.map((cat) => (
          <li key={cat.id} className="py-2 flex justify-between items-center">
            <span>{cat.nome} <span className="text-gray-400 text-xs">({cat.tipo})</span></span>
            <button
              onClick={() => excluirCategoria(cat.id)}
              className="text-red-500 hover:underline text-xs"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GerenciarCategorias;
