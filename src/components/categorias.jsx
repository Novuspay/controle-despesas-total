// src/components/Categorias.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

function Categorias() {
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const unsub = onSnapshot(
      collection(db, 'categorias'),
      (snapshot) => {
        const lista = snapshot.docs
          .filter((doc) => doc.data().uid === usuario.uid)
          .map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategorias(lista);
      }
    );

    return () => unsub();
  }, []);

  const handleAdicionar = async () => {
    const usuario = auth.currentUser;
    if (!novaCategoria.trim() || !usuario) return;

    await addDoc(collection(db, 'categorias'), {
      nome: novaCategoria.trim(),
      uid: usuario.uid
    });
    setNovaCategoria('');
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja excluir esta categoria?')) {
      await deleteDoc(doc(db, 'categorias', id));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Gerenciar Categorias</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          placeholder="Nome da categoria"
          className="flex-grow border border-gray-300 rounded p-2"
        />
        <button
          onClick={handleAdicionar}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Adicionar
        </button>
      </div>
      <ul className="divide-y">
        {categorias.map((cat) => (
          <li key={cat.id} className="flex justify-between py-2">
            <span>{cat.nome}</span>
            <button
              onClick={() => handleExcluir(cat.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categorias;
