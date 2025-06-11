import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

function GerenciarCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [tipo, setTipo] = useState('entrada');

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

  const handleAdicionar = async () => {
    const usuario = auth.currentUser;
    if (!usuario || !novaCategoria || !tipo) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      await addDoc(collection(db, 'categorias'), {
        nome: novaCategoria,
        tipo,
        uid: usuario.uid
      });
      setNovaCategoria('');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, 'categorias', id));
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold text-indigo-600 mb-2">⚙️ Gerenciar Categorias</h2>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Nova categoria"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <button
          onClick={handleAdicionar}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      <ul className="text-sm divide-y">
        {categorias.map((cat) => (
          <li key={cat.id} className="py-2 flex justify-between items-center">
            <span>
              {cat.nome} — <span className="text-gray-500 italic">{cat.tipo}</span>
            </span>
            <button
              onClick={() => handleExcluir(cat.id)}
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
