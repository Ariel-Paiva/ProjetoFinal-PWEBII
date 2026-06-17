"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  tamanho: number;
}

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<number>(39);

  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState<"PIX" | "DINHEIRO" | "">("");
  const [freteCalculado, setFreteCalculado] = useState<number | null>(null);
  const [compraSucesso, setCompraSucesso] = useState(false);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("TODAS");
  const [marcaSelecionada, setMarcaSelecionada] = useState<string>("TODAS");
  const [precoSelecionado, setPrecoSelecionado] = useState<string>("TODOS");

  const tamanhosDisponiveis = [37, 38, 39, 40, 41, 42];

  useEffect(() => {
    async function carregarDados() {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) setProdutos(data);
      
      const salvosFavoritos = localStorage.getItem('sneakers_favoritos');
      if (salvosFavoritos) setFavoritos(JSON.parse(salvosFavoritos));

      const salvosCarrinho = localStorage.getItem('abp_carrinho');
      if (salvosCarrinho) setCarrinho(JSON.parse(salvosCarrinho));
      
      setCarregando(false);
    }
    carregarDados();
  }, []);

  useEffect(() => {
    if (!carregando) {
      localStorage.setItem('abp_carrinho', JSON.stringify(carrinho));
    }
  }, [carrinho, carregando]);

  const categories = ["TODAS", "CASUAL", "ACADEMIA & CORRIDA", "BASQUETE", "FUTSAL", "FUTEBOL"];
  const marcas = ["TODAS", ...Array.from(new Set(produtos.map(p => p.marca?.toUpperCase()).filter(Boolean)))];

  const faixasPreco = [
    { label: "Todos os Preços", value: "TODOS" },
    { label: "R$ 0 - R$ 500", value: "0-500" },
    { label: "R$ 501 - R$ 1.000", value: "501-1000" },
    { label: "R$ 1.001 - R$ 1.500", value: "1001-1500" },
    { label: "R$ 1.501 - R$ 2.000", value: "1501-2000" }
  ];

  const alternarFavorito = (id: number) => {
    let novosFavoritos = [...favoritos];
    if (novosFavoritos.includes(id)) {
      novosFavoritos = novosFavoritos.filter(favId => favId !== id);
    } else {
      novosFavoritos.push(id);
    }
    setFavoritos(novosFavoritos);
    localStorage.setItem('sneakers_favoritos', JSON.stringify(novosFavoritos));
  };

  const adicionarAoCarrinho = (produto: Produto, tamanho: number) => {
    const itemExistente = carrinho.find(item => item.produto.id === produto.id && item.tamanho === tamanho);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        (item.produto.id === produto.id && item.tamanho === tamanho)
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, { produto, quantidade: 1, tamanho }]);
    }
    setProdutoSelecionado(null);
    setCarrinhoAberto(true);
  };

  const removerDoCarrinho = (id: number, tamanho: number) => {
    setCarrinho(carrinho.filter(item => !(item.produto.id === id && item.tamanho === tamanho)));
  };

  useEffect(() => {
    if (!estado) {
      setFreteCalculado(null);
      return;
    }
    const est = estado.trim().toUpperCase();
    if (["CE", "CEARÁ", "CEARA"].includes(est)) setFreteCalculado(0);
    else if (["MA", "PI", "RN", "PB", "PE", "AL", "SE", "BA", "MARANHÃO", "PIAUÍ", "RIO GRANDE DO NORTE", "PARAÍBA", "PERNAMBUCO", "ALAGOAS", "SERGIPE", "BAHIA"].includes(est)) setFreteCalculado(5);
    else if (["PR", "SC", "RS", "PARANÁ", "SANTA CATARINA", "RIO GRANDE DO SUL"].includes(est)) setFreteCalculado(15);
    else setFreteCalculado(10);
  }, [estado]);

  const subtotal = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
  const totalGeral = subtotal + (freteCalculado || 0);

  const finalizarCompra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!endereco || !cidade || !estado || !metodoPagamento) return;
    
    setCompraSucesso(true);
    setCarrinho([]);
    setEndereco("");
    setCidade("");
    setEstado("");
    setComplemento("");
    setMetodoPagamento("");
  };

  const produtosFiltrados = () => {
    return produtos.filter(produto => {
      let esporteProduto = produto.esporte ? produto.esporte.toUpperCase().trim() : "";
      const marcaProduto = produto.marca ? produto.marca.toUpperCase().trim() : "";

      if (esporteProduto === "ACADEMIA E CORRIDA") {
        esporteProduto = "ACADEMIA & CORRIDA";
      }

      const bateuCategoria = categoriaSelecionada === "TODAS" || esporteProduto === categoriaSelecionada;
      const bateuMarca = marcaSelecionada === "TODAS" || marcaProduto === marcaSelecionada;
      
      let bateuPreco = true;
      if (precoSelecionado === "0-500") bateuPreco = produto.preco <= 500;
      else if (precoSelecionado === "501-1000") bateuPreco = produto.preco > 500 && produto.preco <= 1000;
      else if (precoSelecionado === "1001-1500") bateuPreco = produto.preco > 1000 && produto.preco <= 1500;
      else if (precoSelecionado === "1501-2000") bateuPreco = produto.preco > 1500 && produto.preco <= 2000;

      return bateuCategoria && bateuMarca && bateuPreco;
    });
  };

  const listaFiltrada = produtosFiltrados();

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-orange-500 font-bold animate-pulse tracking-widest uppercase">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 py-8 relative w-full flex-grow">
        <header className="mb-12 border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl mb-1 text-white">
              ABP<span className="text-orange-500">FOOTWEAR</span>
            </h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest">Os melhores calçados esportivos para a sua performance.</p>
          </div>

          <div className="flex justify-center gap-3">
            <Link href="/favoritos" className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider">
              ❤️ Favoritos ({favoritos.length})
            </Link>
            <button 
              onClick={() => setCarrinhoAberto(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-wider shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              🛒 Carrinho ({carrinho.reduce((acc, item) => acc + item.quantidade, 0)})
            </button>
          </div>
        </header>

        {produtoSelecionado && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg relative shadow-2xl p-6 text-white max-h-[90vh] flex flex-col overflow-hidden">
              
              <button 
                onClick={() => setProdutoSelecionado(null)} 
                className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800/80 h-9 w-9 rounded-full flex items-center justify-center font-black text-sm transition-all shadow-md cursor-pointer z-25"
                title="Fechar Detalhes"
              >
                ✕
              </button>

              <div className="flex flex-col gap-4 overflow-y-scroll pr-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
                <div className="bg-white rounded-xl p-4 aspect-video flex items-center justify-center relative shrink-0">
                  <img src={produtoSelecionado.imagem_url} alt={produtoSelecionado.nome} className="max-h-40 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{produtoSelecionado.marca}</span>
                  <h2 className="text-lg font-black text-white mt-0.5 leading-snug">{produtoSelecionado.nome}</h2>
                  <span className="inline-block bg-zinc-950 border border-zinc-800 text-[9px] text-gray-400 px-2 py-0.5 rounded mt-2 uppercase tracking-wider font-bold">{produtoSelecionado.esporte}</span>
                </div>
                <div className="border-t border-zinc-800/80 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Especificações do Produto</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {produtoSelecionado.descricao || "Nenhuma descrição informada para este modelo."}
                  </p>
                </div>
                <div className="border-t border-zinc-800/80 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Selecione o Tamanho</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {tamanhosDisponiveis.map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTamanhoSelecionado(num)}
                        className={`py-2 rounded-lg border text-xs font-black transition-all cursor-pointer ${tamanhoSelecionado === num ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-950 border-zinc-800 text-gray-400 hover:border-zinc-700"}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-zinc-800/80 pt-4 mt-1 flex items-center justify-between gap-4 shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Preço Unitário</span>
                    <span className="text-2xl font-black text-white">R$ {produtoSelecionado.preco.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => adicionarAoCarrinho(produtoSelecionado, tamanhoSelecionado)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Confirmar e Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {carrinhoAberto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex justify-end">
            <div className="bg-zinc-900 w-full max-w-md h-full p-6 overflow-y-auto flex flex-col shadow-2xl border-l border-zinc-800 text-white">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">🛒 Seu Carrinho</h2>
                <button onClick={() => setCarrinhoAberto(false)} className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer">✕</button>
              </div>

              {compraSucesso && (
                <div className="bg-emerald-950/50 border border-emerald-500/40 p-4 rounded-xl text-center mb-6">
                  <p className="text-emerald-400 font-black text-sm uppercase tracking-wide">🎉 Pedido Realizado com Sucesso!</p>
                  <p className="text-xs text-gray-400 mt-1">Obrigado por comprar no ABPFOOTWEAR.</p>
                  <button onClick={() => setCompraSucesso(false)} className="mt-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold uppercase transition-all cursor-pointer">Fechar</button>
                </div>
              )}

              {carrinho.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400 py-12">
                  <p className="text-sm italic">Seu carrinho está vazio.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 flex-grow overflow-y-scroll max-h-[52vh] pr-0 mb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
                    {carrinho.map(item => (
                      <div key={`${item.produto.id}-${item.tamanho}`} className="flex gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                        <img src={item.produto.imagem_url} alt={item.produto.nome} className="w-16 h-16 object-contain bg-white rounded-lg p-1" />
                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs font-bold truncate text-zinc-200">{item.produto.nome}</h4>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                            {item.produto.marca} | Tam: <span className="text-orange-500 font-bold">{item.tamanho}</span> (x{item.quantidade})
                          </p>
                          <p className="text-sm font-black text-orange-500 mt-1">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p>
                        </div>
                        <button onClick={() => removerDoCarrinho(item.produto.id, item.tamanho)} className="text-xs text-red-400 hover:text-red-300 self-start p-1 cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={finalizarCompra} className="border-t border-zinc-800 pt-4 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Dados de Entrega</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input required type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="col-span-2 bg-zinc-950 border border-zinc-800 text-xs p-3 rounded-xl outline-none focus:border-orange-500 text-white transition-all" />
                      <input required type="text" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-xs p-3 rounded-xl outline-none focus:border-orange-500 text-white transition-all" />
                      <input required type="text" placeholder="Estado (Ex: CE, SP, PR)" value={estado} onChange={e => setEstado(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-xs p-3 rounded-xl outline-none focus:border-orange-500 text-white transition-all" />
                      <input type="text" placeholder="Complemento (Opcional)" value={complemento} onChange={e => setComplemento(e.target.value)} className="col-span-2 bg-zinc-950 border border-zinc-800 text-xs p-3 rounded-xl outline-none focus:border-orange-500 text-white transition-all" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Forma de Pagamento</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          type="button"
                          onClick={() => setMetodoPagamento("PIX")}
                          className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider cursor-pointer ${metodoPagamento === "PIX" ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-zinc-950 border-zinc-800 text-gray-400 hover:border-zinc-700"}`}
                        >
                          Pix
                        </button>
                        <button 
                          type="button"
                          onClick={() => setMetodoPagamento("DINHEIRO")}
                          className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all tracking-wider cursor-pointer ${metodoPagamento === "DINHEIRO" ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-zinc-950 border-zinc-800 text-gray-400 hover:border-zinc-700"}`}
                        >
                          Dinheiro
                        </button>
                      </div>
                    </div>

                    {metodoPagamento === "PIX" && (
                      <div className="bg-zinc-950 p-3.5 rounded-xl border border-orange-500/20 text-center space-y-1 animate-fadeIn">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Chave Copia e Cola (Telefone)</p>
                        <p className="text-sm font-black text-orange-500 select-all font-mono">(85) 6767-6677</p>
                        <p className="text-[9px] text-gray-500 italic">Efetue o pagamento para validar seu envio.</p>
                      </div>
                    )}

                    <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs space-y-1.5 font-medium">
                      <div className="flex justify-between text-zinc-400">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Frete:</span>
                        <span className={freteCalculado === null ? "text-zinc-400 font-normal" : "font-bold text-white"}>
                          {freteCalculado === null ? "R$--" : freteCalculado === 0 ? "GRÁTIS 🎉" : `R$ ${freteCalculado.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-black border-t border-zinc-800 pt-2 text-white">
                        <span>Total do Pedido:</span>
                        <span className="text-orange-500">R$ {totalGeral.toFixed(2)}</span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={!metodoPagamento}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-black py-3.5 px-4 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                    >
                      Finalizar Compra
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 mb-12 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">FILTRAR CATÁLOGO</h2>
          
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-gray-500">Esporte / Categoria</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    type="button"
                    onClick={() => setCategoriaSelecionada(cat)} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${categoriaSelecionada === cat ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-gray-500">Marca</label>
              <div className="flex flex-wrap gap-2">
                {marcas.map(m => (
                  <button 
                    key={m} 
                    type="button"
                    onClick={() => setMarcaSelecionada(m)} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${marcaSelecionada === m ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-gray-500">Faixa de Preço</label>
              <div className="flex flex-wrap gap-2">
                {faixasPreco.map(faixa => (
                  <button 
                    key={faixa.value} 
                    type="button"
                    onClick={() => setPrecoSelecionado(faixa.value)} 
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${precoSelecionado === faixa.value ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20" : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-700"}`}
                  >
                    {faixa.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-wider text-white border-l-4 border-orange-500 pl-3">Produtos Encontrados</h2>
          </div>

          {listaFiltrada.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950 rounded-2xl border border-zinc-900">
              <p className="text-gray-400 text-lg italic">Nenhum tênis atende aos filtros selecionados.</p>
              <button onClick={() => { setCategoriaSelecionada("TODAS"); setMarcaSelecionada("TODAS"); setPrecoSelecionado("TODOS"); }} className="mt-4 text-orange-500 font-bold hover:underline cursor-pointer text-sm">Limpar todos os filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {listaFiltrada.map((produto: Produto) => {
                const isFavorito = favoritos.includes(produto.id);
                return (
                  <div key={produto.id} className="group relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900 shadow-sm flex flex-col h-full transition-all duration-300 hover:border-zinc-700">
                    <div onClick={() => { setProdutoSelecionado(produto); setTamanhoSelecionado(39); }} className="aspect-square w-full overflow-hidden bg-white relative cursor-pointer">
                      <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                      <button onClick={(e) => { e.stopPropagation(); alternarFavorito(produto.id); }} className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-all duration-200 backdrop-blur-sm cursor-pointer z-10">
                        <span className="text-lg block leading-none">{isFavorito ? '❤️' : '🤍'}</span>
                      </button>
                      <span className="absolute bottom-3 left-3 bg-zinc-950/90 border border-zinc-800 text-[10px] text-gray-300 px-2 py-1 rounded-md font-bold uppercase tracking-wider">{produto.esporte}</span>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">{produto.marca}</p>
                      <h3 onClick={() => { setProdutoSelecionado(produto); setTamanhoSelecionado(39); }} className="text-sm font-bold text-gray-200 line-clamp-2 mb-2 min-h-[40px] cursor-pointer hover:text-orange-500 transition-colors">
                        {produto.nome}
                      </h3>
                      <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-3">
                        <p className="text-xl font-black text-white">R$ {produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => { setProdutoSelecionado(produto); setTamanhoSelecionado(39); }} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 px-4 rounded-xl text-xs transition-colors duration-200 uppercase tracking-wider cursor-pointer shadow-md shadow-orange-500/5">
                          Adicionar ao Carrinho
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}