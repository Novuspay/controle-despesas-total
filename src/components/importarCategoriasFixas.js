// src/components/importarCategoriasFixas.js
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import categoriasFixas from '../categoriasFixas';

export const importarCategoriasFixas = async () => {
  const usuario = auth.currentUser;
  if (!usuario) return;

  const snapshot = await getDocs(collection(db, 'categorias'));
  const categoriasExistentes = snapshot.docs.map((doc) => doc.data().nome);

  for (const categoria of categoriasFixas) {
    if (!categoriasExistentes.includes(categoria.nome)) {
      await addDoc(collection(db, 'categorias'), {
        nome: categoria.nome,
        tipo: categoria.tipo,
        uid: usuario.uid,
        criadoEm: new Date()
      });
    }
  }
};
