// src/components/importarCategoriasFixas.js
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import categoriasFixas from '../categoriasFixas';

export const importarCategoriasFixas = async () => {
  const usuario = auth.currentUser;
  if (!usuario) return;

  const snapshot = await getDocs(collection(db, 'categorias'));
  const jaExistem = snapshot.docs.some((doc) => doc.data().uid === usuario.uid);

  if (jaExistem) return;

  const promessas = categoriasFixas.map((cat) =>
    addDoc(collection(db, 'categorias'), {
      ...cat,
      uid: usuario.uid,
      criadoEm: new Date()
    })
  );

  await Promise.all(promessas);
};
