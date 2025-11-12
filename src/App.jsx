import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Importar XLSX aqui, pois a leitura será feita no App.
import Home from './Home.jsx';
import Analises from './Analises.jsx';
import Formulario from './Formulario.jsx';
import Avaliacao from './Avaliacao.jsx';

// CONSTANTES DO ARQUIVO (movidas para App.jsx)
const FILE_PATH = '/TESTE FUZZY_REACT.xlsx';
const SHEET_NAME = 'PLANILHA';

// --- ESTILOS PARA SIDEBAR E LAYOUT PRINCIPAL (Mantidos) ---
const sidebarStyles = {
    backgroundColor: '#0f172a',
    width: '250px',
    minHeight: '100vh',
    padding: '20px 0',
    boxShadow: '4px 0 8px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    padding: '10px 15px',
    margin: '10px 0',
    width: '80%',
    textAlign: 'center',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
};

const activeLinkStyle = {
    backgroundColor: '#191970',
    borderLeft: '4px solid #82ca9d'
};

const contentContainerStyles = {
    flexGrow: 1,
    overflowY: 'auto',
};

// --- COMPONENTE DE NAVEGAÇÃO (Sidebar) ---
const SideBar = () => {
    const location = useLocation();

    return (
        <nav style={sidebarStyles}>
            <h3 style={{ marginBottom: '40px', color: '#82ca9d' }}>DASHBOARD MENU</h3>

            <Link
                to="/"
                style={{
                    ...navLinkStyle,
                    ...(location.pathname === '/' ? activeLinkStyle : {})
                }}
            >
                Home
            </Link>

            <Link
                to="/analises"
                style={{
                    ...navLinkStyle,
                    ...(location.pathname === '/analises' ? activeLinkStyle : {})
                }}
            >
                Análises de Convênios
            </Link>
        </nav>
    );
};

// --- COMPONENTE PRINCIPAL (App) ---
function App() {
    const [metrics, setMetrics] = useState({ totalConvenios: 0, saldoGeral: 0, mediaTaxaConclusao: 0, totalAtivosValor: 0, idadeMediaAtivos: 0 });
    const [originalData, setOriginalData] = useState({ saldo: [], prazo: [] });
    const [chartData, setChartData] = useState({ saldo: [], prazo: [] });
    const [convenios, setConvenios] = useState([]);
    const [taxasConclusao, setTaxasConclusao] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [loadingError, setLoadingError] = useState(null); // Para tratar erros de forma global
    const [projetoAvaliacao, setProjetoAvaliacao] = useState(null);
    const [convenioSelecionado, setConvenioSelecionado] = useState(null);

    // --- DATA FETCHING E CÁLCULO (Executa no carregamento do App) ---
    useEffect(() => {
        const readExcel = async () => {
            try {
                const res = await fetch(FILE_PATH);
                if (!res.ok) throw new Error(`Erro ao carregar o arquivo: ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: "buffer" });

                if (!workbook.SheetNames.includes(SHEET_NAME)) throw new Error(`A aba "${SHEET_NAME}" não foi encontrada.`);
                const worksheet = workbook.Sheets[SHEET_NAME];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Processamento dos dados
                console.log('Dados brutos da planilha:', jsonData);
                const saldoData = jsonData.map((row) => ({
                    convenio: row["CONVÊNIO"] || row["Convenio"] || "Sem Nome",
                    saldo: Number(row["SALDO"] || row["Saldo"] || 0),
                }));
                const prazoData = jsonData.map((row) => ({
                    convenio: row["CONVÊNIO"] || row["Convenio"] || "Sem Nome",
                    prazo: Number(row["PRAZO"] || row["Prazo"] || 0),
                }));

                // Extrai as taxas de conclusão por convênio
                const taxasConclusaoData = jsonData.map((row) => {
                    const convenio = row["CONVÊNIO"] || row["Convenio"] || "Sem Nome";
                    const raw = row["TAXA DE CONCLUSÃO"]
                        ?? row["TAXA DE CONCLUSAO"]
                        ?? row["Taxa de Conclusão"]
                        ?? row["Taxa de Conclusao"]
                        ?? row["TAXA_DE_CONCLUSAO"]
                        ?? row["TaxaConclusao"]
                        ?? 0;
                    const n = Number(raw);
                    return {
                        convenio: convenio,
                        taxa: Number.isNaN(n) ? 0 : n
                    };
                });

                // Calcula a média da Taxa de Conclusão para o dashboard
                const mediaTaxaConclusao = taxasConclusaoData.length 
                    ? taxasConclusaoData.reduce((sum, item) => sum + item.taxa, 0) / taxasConclusaoData.length 
                    : 0;

                // Cálculo da Soma Total
                const total = saldoData.reduce((sum, item) => sum + item.saldo, 0);

                // --- LEITURA ADICIONAL: Planilha de equipamentos (soma do valor e média da idade) ---
                const equipSheetNames = workbook.SheetNames.filter(n => /EQUIPAMENTOS?|Equipamentos?|Equipamento/i.test(n));
                let totalAtivosValor = 0;
                let idadeMediaAtivos = 0;

                if (equipSheetNames.length) {
                    // Prioriza o primeiro encontrado
                    const equipSheet = workbook.Sheets[equipSheetNames[0]];
                    const equipData = XLSX.utils.sheet_to_json(equipSheet);

                    // Função auxiliar para extrair número de várias chaves prováveis
                    const extractNumber = (row, keys) => {
                        for (const k of keys) {
                            if (Object.prototype.hasOwnProperty.call(row, k)) {
                                const n = Number(String(row[k]).replace(/[^0-9,.-]/g, '').replace(',', '.'));
                                return Number.isNaN(n) ? null : n;
                            }
                        }
                        return null;
                    };

                    // Chaves prováveis para valor e idade
                    const valorKeys = [
                        'VALOR ATUAL DO EQUIPAMENTO', 'VALOR ATUAL EQUIPAMENTO', 'VALOR_ATUAL_DO_EQUIPAMENTO',
                        'VALOR ATUAL', 'VALOR_ATUAL', 'VALOR', 'Valor', 'Valor Atual'
                    ];
                    const idadeKeys = [
                        'IDADE DO EQUIPAMENTO', 'IDADE_EQUIPAMENTO', 'IDADE', 'Idade', 'IDADE DO ATIVO'
                    ];

                    // Soma dos valores válidos
                    const valores = equipData.map(row => extractNumber(row, valorKeys)).filter(v => v !== null);
                    if (valores.length) totalAtivosValor = valores.reduce((s, v) => s + v, 0);

                    // Média das idades válidas
                    const idades = equipData.map(row => extractNumber(row, idadeKeys)).filter(v => v !== null);
                    if (idades.length) idadeMediaAtivos = idades.reduce((s, v) => s + v, 0) / idades.length;
                }

                // Extrair lista única de convênios
                const uniqueConvenios = [...new Set(saldoData.map(item => item.convenio))];
                console.log('Convênios carregados:', uniqueConvenios);
                
                // Define todos os estados
                setOriginalData({ saldo: saldoData, prazo: prazoData });
                setChartData({ saldo: saldoData, prazo: prazoData });
                setConvenios(uniqueConvenios);
                setTaxasConclusao(taxasConclusaoData);
                setMetrics({
                    totalConvenios: saldoData.length,
                    saldoGeral: total,
                    mediaTaxaConclusao: mediaTaxaConclusao,
                    totalAtivosValor,
                    idadeMediaAtivos
                });
                setDataLoaded(true);
                setLoadingError(null);

            } catch (err) {
                console.error("Erro ao processar o arquivo:", err);
                setMetrics({ totalConvenios: 0, saldoGeral: 0, mediaTaxaConclusao: 0 });
                setDataLoaded(true); // Carregamento falhou, mas não está mais "loading"
                setLoadingError(`Falha na importação do arquivo: ${err.message}`);
            }
        };

        readExcel();
    }, []);

    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS ---
    const handleClearData = () => {
        // Zera os valores do gráfico
        const zeroedSaldo = originalData.saldo.map(item => ({ ...item, saldo: 0 }));
        const zeroedPrazo = originalData.prazo.map(item => ({ ...item, prazo: 0 }));

        setChartData({ saldo: zeroedSaldo, prazo: zeroedPrazo });

        // Atualiza as métricas da Home (mantém a contagem, zera o saldo)
        setMetrics(prev => ({ ...prev, saldoGeral: 0 }));
    };

    const handleRestoreData = () => {
        // Restaura os dados originais (em caso de botão "restaurar", não solicitado, mas útil)
        const total = originalData.saldo.reduce((sum, item) => sum + item.saldo, 0);
        setChartData(originalData);
        setMetrics(prev => ({ ...prev, saldoGeral: total }));
    };

    return (
        <Router>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                <SideBar />
                <main style={contentContainerStyles}>
                    <Routes>
                        {/* HOME: Recebe as métricas PRONTAS e o status de carregamento */}
                        <Route
                            path="/"
                            element={<Home
                                metrics={metrics}
                                isDataLoaded={dataLoaded}
                                loadingError={loadingError}
                            />}
                        />

                        {/* ANÁLISES: Recebe os dados de gráfico e funções de manipulação */}
                        <Route
                            path="/analises"
                            element={<Analises
                                chartDataSaldo={chartData.saldo}
                                chartDataPrazo={chartData.prazo}
                                saldoGeral={metrics.saldoGeral}
                                isDataLoaded={dataLoaded}
                                loadingError={loadingError}
                                onClearData={handleClearData}
                            />}
                        />

                        {/* FORMULÁRIO: página para criar/editar projetos */}
                        <Route
                            path="/formulario"
                            element={<Formulario 
                                convenios={convenios}
                                taxasConclusao={taxasConclusao}
                                isDataLoaded={dataLoaded}
                                onSubmit={(data) => {
                                    console.log('Dados do formulário recebidos:', data);
                                    setProjetoAvaliacao(data);
                                    setConvenioSelecionado(data.tipoAquisicao);
                                }}
                            />}
                        />
                        <Route
                            path="/avaliacao"
                            element={<Avaliacao 
                                projetoData={{
                                    ...projetoAvaliacao,
                                    tempoPrevisto: projetoAvaliacao?.prazo,
                                    tempoReal: projetoAvaliacao?.prazo,
                                    orcamentoPrevisto: projetoAvaliacao?.valor,
                                    orcamentoReal: projetoAvaliacao?.valor,
                                    taxaConclusao: projetoAvaliacao?.taxaConclusao,
                                    taxaErro: projetoAvaliacao?.taxaErro,
                                    numeroPessoas: projetoAvaliacao?.numeroPessoas,
                                    numeroEntregas: projetoAvaliacao?.numeroEntregas,
                                    risco: projetoAvaliacao?.risco,
                                }}
                                convenioSelecionado={convenioSelecionado}
                                dadosConvenio={{
                                    saldo: chartData.saldo.find(item => item.convenio === convenioSelecionado)?.saldo,
                                    prazo: chartData.prazo.find(item => item.convenio === convenioSelecionado)?.prazo
                                }}
                            />}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;