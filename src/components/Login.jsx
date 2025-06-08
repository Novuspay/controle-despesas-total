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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-300 via-white to-blue-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        
        {/* Ícone SVG */}
        <div className="flex justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3l7.5 4.5v5.25c0 4.5-3.2 8.6-7.5 9.75-4.3-1.15-7.5-5.25-7.5-9.75V7.5L12 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Acessar Conta
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1 text-sm">E-mail</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1 text-sm">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-2 rounded-md"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            className="block text-center w-full text-sm text-blue-600 hover:underline mt-1"
          >
            Esqueceu a senha?
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
