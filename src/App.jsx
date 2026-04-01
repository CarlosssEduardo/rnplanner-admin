import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

/**
 * COMPONENTE: App (Painel Administrativo)
 * @description Dashboard gerencial exclusivo para o backoffice (Quartel General).
 * Responsável pelo upload dos planificadores (PDFs), dados logísticos e gestão da Lista VIP de acessos.
 */
function App() {
  
  // =========================================================================
  // 1. STATE MANAGEMENT (Gerenciamento de Estado)
  // =========================================================================

  // Armazenamento em memória dos arquivos selecionados pelo usuário
  const [arquivoPdv, setArquivoPdv] = useState(null);
  const [arquivoEntrega, setArquivoEntrega] = useState(null);
  
  // Gestão de Acessos (Catraca do Sistema)
  const [setorVip, setSetorVip] = useState('');
  const [setoresLiberados, setSetoresLiberados] = useState([]);

  // Controles de UI (Experiência do Usuário)
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visivel: false, tipo: '', titulo: '', mensagem: '', arquivo: '' });
  const [feedback, setFeedback] = useState({ visivel: false, tipo: '', mensagem: '' });

  // =========================================================================
  // 2. CONFIGURAÇÃO DE AMBIENTE (Environment Variable)
  // =========================================================================
  // Resolução inteligente: Utiliza o servidor local no desenvolvimento e a Azure em Produção.
  const BASE_URL = import.meta.env.VITE_API_URL || 'https://rnplanner-api-ekc2hratcvgqhgc5.brazilsouth-01.azurewebsites.net';

  // =========================================================================
  // 3. LIFECYCLE E HELPERS
  // =========================================================================

  /**
   * Exibe um alerta flutuante temporário na tela para confirmar sucesso ou erro de ações.
   */
  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ visivel: true, tipo, mensagem });
    setTimeout(() => setFeedback({ visivel: false, tipo: '', mensagem: '' }), 4000);
  };

  /**
   * Hook de inicialização: Dispara imediatamente ao abrir a tela.
   * Sincroniza a tabela visual com os dados de acesso liberados no Back-End.
   */
  useEffect(() => {
    carregarListaVip();
  }, []);

  // =========================================================================
  // 4. CORE LOGIC (Regras de Negócio - Acessos)
  // =========================================================================

  const carregarListaVip = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/setores-vip`);
      setSetoresLiberados(response.data);
    } catch (error) {
      console.error("Erro Crítico ao carregar Catraca de Acessos", error);
    }
  };

  /**
   * Autoriza a entrada de um novo setor na plataforma (Whitelist).
   */
  const handleAdicionarVip = async () => {
    if (!setorVip.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/setores-vip/adicionar/${setorVip}`);
      mostrarFeedback('sucesso', `✅ Acesso liberado para o setor ${setorVip}!`);
      setSetorVip('');
      carregarListaVip(); // Atualiza a tabela na tela imediatamente
    } catch (error) {
      mostrarFeedback('erro', '❌ Falha ao liberar acesso. Verifique se o setor já possui permissão.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Revoga a permissão de acesso de um setor, bloqueando a entrada do aplicativo.
   */
  const handleRemoverVip = async (id, numeroSetor) => {
    // Confirmação dupla de segurança para evitar cliques acidentais
    if(!window.confirm(`Tem certeza que deseja BLOQUEAR o acesso do setor ${numeroSetor}?`)) return;
    
    try {
      await axios.delete(`${BASE_URL}/setores-vip/remover/${id}`);
      mostrarFeedback('sucesso', `Acesso do setor ${numeroSetor} revogado!`);
      carregarListaVip();
    } catch (error) {
      mostrarFeedback('erro', 'Erro ao processar a revogação de acesso.');
    }
  };

  // =========================================================================
  // 5. CORE LOGIC (Processamento de Arquivos)
  // =========================================================================

  const handleUploadPdv = () => {
    if (!arquivoPdv) return;
    setModal({
      visivel: true, tipo: 'pdv', titulo: 'Confirmar Planificador PDF 🏪',
      mensagem: 'O sistema vai ler o PDF via OCR, extrair as metas do dia (Subdivisão de Tasks, Missões, Ofertas) e identificar o Ranking da equipe.',
      arquivo: arquivoPdv.name
    });
  };

  const handleUploadEntrega = () => {
    if (!arquivoEntrega) return;
    setModal({
      visivel: true, tipo: 'entrega', titulo: 'Confirmar Rota Logística 🚚',
      mensagem: 'O sistema processará o arquivo CSV para alimentar o radar de entregas da frota.',
      arquivo: arquivoEntrega.name
    });
  };

  const fecharModal = () => setModal({ ...modal, visivel: false });

  /**
   * Empacota o arquivo físico da máquina do administrador utilizando a interface nativa
   * FormData e despacha para os manipuladores multipart/form-data do Spring Boot.
   */
  const confirmarEnvio = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
      if (modal.tipo === 'pdv') {
        formData.append('file', arquivoPdv); 
        await axios.post(`${BASE_URL}/pdvs/upload-pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarFeedback('sucesso', '✅ PDF Processado com Sucesso! A base comercial foi atualizada.');
        setArquivoPdv(null);
        
      } else if (modal.tipo === 'entrega') {
        formData.append('file', arquivoEntrega); 
        await axios.post(`${BASE_URL}/entregas/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarFeedback('sucesso', '🚚 Mapeamento da Logística da frota atualizado!');
        setArquivoEntrega(null);
      }
      fecharModal();

    } catch (error) {
      console.error("Falha no transporte do arquivo:", error);
      mostrarFeedback('erro', '❌ Falha Crítica. O arquivo enviado está corrompido ou fora do layout esperado.');
      fecharModal();
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 6. RENDERIZAÇÃO DA UI (JSX)
  // =========================================================================

  return (
    <div className="admin-container">
      
      {/* CABEÇALHO SUPERIOR */}
      <header className="admin-header">
        <div className="logo-area">
          <h1>Painel de Comando 🦅</h1>
          <span className="subtitle">RN Planner - Setor Administrativo </span>
        </div>
        <span className="badge-admin">Acesso Restrito - Admin - Carlos Eduardo</span>
      </header>

      {/* ÁREA DE TRABALHO PRINCIPAL */}
      <main className="admin-content">
        <div className="cards-grid">
          
          {/* Módulo 1: Integração Comercial (Metas/PDV) */}
          <div className="upload-card card-pdv">
            <h2>🏪 Metas e Clientes</h2>
            <p>Suba o <b>Planificador em PDF</b> para atualizar as metas diárias, o RKG e o Score 5 do setor.</p>
            <div className="file-input-wrapper">
              <input type="file" className="input-arquivo" accept=".pdf" onChange={(e) => setArquivoPdv(e.target.files[0])} />
            </div>
            <button className={`btn-upload ${arquivoPdv ? 'btn-pdv-pronto' : ''}`} onClick={handleUploadPdv} disabled={!arquivoPdv}>
              {arquivoPdv ? '🚀 ATUALIZAR METAS E PDVS' : 'ESCOLHER PLANIFICADOR PDF'}
            </button>
          </div>

          {/* Módulo 2: Integração Logística (Rastreio) */}
          <div className="upload-card card-entrega">
            <h2>🚚 Rotas de Entrega</h2>
            <p>Suba o arquivo logístico em formato de planilha para atualizar o status do radar de entregas.</p>
            <div className="file-input-wrapper wrapper-blue">
              <input type="file" className="input-arquivo" accept=".csv, .xlsx, .xls" onChange={(e) => setArquivoEntrega(e.target.files[0])} />
            </div>
            <button className={`btn-upload ${arquivoEntrega ? 'btn-entrega-pronto' : ''}`} onClick={handleUploadEntrega} disabled={!arquivoEntrega}>
              {arquivoEntrega ? '📦 ATUALIZAR ENTREGAS' : 'ESCOLHER PLANILHA LOGÍSTICA'}
            </button>
          </div>

          {/* Módulo 3: Segurança da Plataforma (Catraca/Lista VIP) */}
          <div className="upload-card card-vip">
            <h2>🔑 Gestão de Acessos</h2>
            <p>Gerencie quem tem autorização para utilizar o RNPlanner na rua.</p>
            
            <div className="vip-input-row" style={{ display: 'flex', gap: '10px', marginTop: '15px', marginBottom: '15px' }}>
              <input 
                type="number" 
                placeholder="Ex: 507" 
                value={setorVip}
                onChange={(e) => setSetorVip(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
              />
              <button 
                onClick={handleAdicionarVip} 
                disabled={loading || !setorVip}
                style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                LIBERAR
              </button>
            </div>

            <div className="vip-lista-scroll" style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '10px' }}>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Setores Autorizados:</span>
              {setoresLiberados.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>A catraca está trancada. Nenhum setor VIP no momento.</span>
              ) : (
                setoresLiberados.map(vip => (
                  <div key={vip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', marginBottom: '5px', border: '1px solid #eee' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Setor {vip.setor}</span>
                    <button onClick={() => handleRemoverVip(vip.id, vip.setor)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Bloquear ❌</button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* =========================================================================
          7. MODAIS E FEEDBACKS VISUAIS
          ========================================================================= */}
      
      {/* Modal de Confirmação de Upload */}
      {modal.visivel && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.tipo === 'pdv' ? 'modal-borda-pdv' : 'modal-borda-entrega'}`}>
            <h3 className="modal-titulo">{modal.titulo}</h3>
            <div className="modal-arquivo-box">
              <span className="modal-label">Arquivo Selecionado:</span>
              <span className="modal-nome-arquivo">{modal.arquivo}</span>
            </div>
            <p className="modal-texto">{modal.mensagem}</p>
            <div className="modal-botoes">
              <button className="btn-cancelar" onClick={fecharModal} disabled={loading}>CANCELAR</button>
              <button className={`btn-confirmar ${modal.tipo === 'pdv' ? 'btn-conf-pdv' : 'btn-conf-entrega'}`} onClick={confirmarEnvio} disabled={loading}>
                {loading ? '🚀 PROCESSANDO...' : 'CONFIRMAR ENVIO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Flutuante de Sucesso/Erro */}
      {feedback.visivel && (
        <div className={`toast-feedback ${feedback.tipo === 'sucesso' ? 'toast-sucesso' : 'toast-erro'}`}>
          {feedback.mensagem}
        </div>
      )}
      
    </div>
  );
}

export default App;