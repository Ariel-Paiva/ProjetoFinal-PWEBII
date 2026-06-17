"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

interface Produto {
  id: number;
  nome: string;
  marca: string;
  preco: number;
  esporte: string;
  imagem_url: string;
  descricao: string;
}

export default function Favoritos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      const salvosFavoritos = localStorage.getItem('sneakers_favoritos');
      const idsFavoritos: number[] = salvosFavoritos ? JSON.parse(salvosFavoritos) : [];
      setFavoritos(idsFavoritos);

      if (idsFavoritos.length > 0) {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .in('id', idsFavoritos);

        if (!error && data) {
          setProdutos(data);
        }
      }
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const removerFavorito = (id: number) => {
    const novosIds = favoritos.filter(favId => favId !== id);
    setFavoritos(novosIds);
    localStorage.setItem('sneakers_favoritos', JSON.stringify(novosIds));
    setProdutos(produtos.filter(p => p.id !== id));
  };

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-orange-500 font-bold animate-pulse tracking-widest uppercase">Carregando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 py-8 relative w-full flex-grow">
        <header className="mb-12 border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-1 text-white">
                ABP<span className="text-orange-500">FOOTWEAR</span>
              </h1>
            </Link>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Seus modelos preferidos guardados em um só lugar.</p>
          </div>

          <div className="flex justify-center gap-3">
            <Link href="/" className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider">
              ← Voltar ao Catálogo
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black uppercase tracking-wider text-white border-l-4 border-orange-500 pl-3">
            Meus Favoritos
          </h2>
        </div>

        {produtos.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-zinc-800/50 max-w-4xl mx-auto">
            <p className="text-gray-400 text-lg italic">Você ainda não favoritou nenhum tênis.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <div key={produto.id} className="group relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900 shadow-sm flex flex-col h-full transition-all duration-300 hover:border-zinc-700">
                <div className="aspect-square w-full overflow-hidden bg-white relative">
                  <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                  
                  <button 
                    onClick={() => removerFavorito(produto.id)} 
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-all duration-200 backdrop-blur-sm cursor-pointer z-10"
                  >
                    <span className="text-lg block leading-none">❤️</span>
                  </button>

                  <span className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 text-[10px] text-gray-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                    {produto.esporte}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">{produto.marca}</p>
                  <h3 className="text-sm font-bold text-gray-200 line-clamp-2 mb-2 min-h-[40px]">
                    {produto.nome}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-3">
                    <p className="text-xl font-black text-white">R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <Link href="/" className="w-full bg-zinc-950 hover:bg-zinc-800 text-gray-300 border border-zinc-800 hover:border-zinc-700 text-center font-bold py-3 px-4 rounded-xl text-xs transition-colors duration-200 uppercase tracking-wider">
                      Ver no Catálogo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}