import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/dashboard');
    } catch (error) {
      setErro('Email ou senha incorretos');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErro('Informe o email para recuperar a senha');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Email de recuperação enviado com sucesso.');
    } catch (error) {
      setErro('Erro ao enviar email: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-blue-600 mt-3 hover:underline text-sm"
          >
            Esqueceu a senha?
          </button>

          <div className="text-center mt-4 text-sm">
            <span>Não tem uma conta? </span>
            <Link to="/register" className="text-blue-500 hover:underline">
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
