import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#191970',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: '2em',
        marginBottom: '15px',
        textAlign: 'center'
    },
    section: {
        width: '90%',
        maxWidth: '900px',
        margin: '8px 0',
        padding: '15px',
        backgroundColor: '#36454F',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
    },
    card: {
        backgroundColor: '#1f2937',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        marginBottom: '8px'
    },
    cardTitle: {
        fontSize: '1.5em',
        color: '#cbd5e1',
        marginBottom: '15px',
        textAlign: 'center'
    },
    cardValue: {
        fontSize: '1.8em',
        fontWeight: '700',
        color: '#82ca9d',
        textAlign: 'center'
    },
    link: {
        color: '#82ca9d',
        textDecoration: 'none',
        fontWeight: 'bold',
        marginTop: '20px',
        display: 'block',
        textAlign: 'center'
    }
};

// URL do backend - usa variável de ambiente ou localhost como fallback
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

function Avaliacao({ projetoData, convenioSelecionado, dadosConvenio }) {
    const [avaliacaoResult, setAvaliacaoResult] = useState(null);
    const [graficoPath, setGraficoPath] = useState(null);
    const [gerandoGrafico, setGerandoGrafico] = useState(false);
    
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>AVALIAÇÃO DO PROJETO {projetoData?.projeto ? projetoData.projeto.toUpperCase() : ''}</h1>

            <div style={styles.section}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Avaliação de Custo</h3>
                    <div style={styles.cardValue}>
                       Custo do Projeto: {formatCurrency(projetoData.valor || 0)}
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '10px', color: '#cbd5e1' }}>
                        Saldo do Convênio: {formatCurrency(dadosConvenio?.saldo || 0)}
                    </p>
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Avaliação de Prazo</h3>
                    <div style={styles.cardValue}>
                      Prazo do Projeto: {(projetoData.prazo || 0)} meses
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '10px', color: '#cbd5e1' }}>
                        Prazo do Convênio: {(dadosConvenio?.prazo || 0)} meses
                    </p>
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Avaliação de Performance do Convênio</h3>
                    <div style={styles.cardValue}>
                        Taxa de Conclusão de Projetos: {(projetoData.taxaConclusao || 0)}%
                    </div>
                 
                </div>
            </div>

            <div style={styles.section}>
                <button
                    onClick={handleAvaliar}
                    style={{
                        ...styles.btn,
                        backgroundColor: '#82ca9d',
                        color: '#062018',
                        width: '100%',
                        padding: '15px',
                        marginBottom: '15px',
                        fontSize: '1.1em'
                    }}
                >
                    Realizar Avaliação Fuzzy
                </button>

                {avaliacaoResult && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Resultado da Avaliação</h3>
                        <div style={styles.cardValue}>
                            {avaliacaoResult.classificacao}
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '10px', color: '#cbd5e1' }}>
                            Nível de Sucesso: {Number(avaliacaoResult?.nivel_sucesso ?? 0).toFixed(2)}%
                        </p>
                        <div style={{ marginTop: '15px', color: '#cbd5e1' }}>
                            <p>Percentual do Custo: {Number(
                                (avaliacaoResult?.detalhes?.percentual_custo ?? avaliacaoResult?.detalhes?.percentual_saldo ?? 0)
                            ).toFixed(2)}%</p>
                            <p>Percentual do Prazo: {Number(
                                avaliacaoResult?.detalhes?.percentual_prazo ?? 0
                            ).toFixed(2)}%</p>
                            {/* Removido a pedido: Eficiência e Qualidade */}
                        </div>
                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#2d3748', borderRadius: '4px', color: '#cbd5e1' }}>
                            <h4 style={{ fontSize: '1.1em', marginBottom: '8px' }}>Recomendações:</h4>
                            <p>{avaliacaoResult.recomendacoes}</p>
                        </div>
                        
                        <button
                            onClick={handleGerarGrafico}
                            disabled={gerandoGrafico}
                            style={{
                                backgroundColor: '#4299e1',
                                color: 'white',
                                width: '100%',
                                padding: '12px',
                                marginTop: '15px',
                                fontSize: '1em',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: gerandoGrafico ? 'not-allowed' : 'pointer',
                                opacity: gerandoGrafico ? 0.6 : 1
                            }}
                        >
                            {gerandoGrafico ? 'Gerando gráfico...' : 'Gerar e Baixar Gráfico Fuzzy'}
                        </button>
                    </div>
                )}
            </div>

            <Link to="/formulario" style={styles.link}>Voltar para o Formulário</Link>
        </div>
    );

    async function handleAvaliar() {
        try {
            if (!dadosConvenio || !projetoData) {
                throw new Error('Dados do convênio ou projeto estão faltando');
            }

            console.log('Dados do convênio:', dadosConvenio);
            console.log('Dados do projeto:', projetoData);

            const dadosParaEnviar = {
                    saldo_convenio: dadosConvenio.saldo,
                    prazo_convenio: dadosConvenio.prazo,
                    valor_projeto: projetoData.valor,
                    prazo_projeto: projetoData.prazo,
                    taxa_conclusao: projetoData.taxaConclusao
            };

            // Verificar se algum valor está undefined ou null
            Object.entries(dadosParaEnviar).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    throw new Error(`O campo ${key} está faltando ou é inválido`);
                }
            });

            console.log('Dados sendo enviados para o backend:', dadosParaEnviar);

            const response = await fetch(`${BACKEND_URL}/avaliar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Resposta do servidor:', errorData);
                throw new Error(`Erro ao realizar avaliação: ${errorData}`);
            }

            const resultado = await response.json();
            console.log('Resposta do backend:', resultado);
            setAvaliacaoResult(resultado);
        } catch (error) {
            console.error('Erro detalhado:', error);
            let mensagemErro = 'Erro ao realizar a avaliação: ';

            if (error.message) {
                mensagemErro += error.message;
            } else {
                mensagemErro += 'Erro desconhecido';
            }

            console.error('Mensagem de erro:', mensagemErro);
            alert(mensagemErro);
        }
    }

    async function handleGerarGrafico() {
        try {
            setGerandoGrafico(true);
            
            if (!dadosConvenio || !projetoData) {
                throw new Error('Dados do convênio ou projeto estão faltando');
            }

            const dadosParaEnviar = {
                saldo_convenio: dadosConvenio.saldo,
                prazo_convenio: dadosConvenio.prazo,
                valor_projeto: projetoData.valor,
                prazo_projeto: projetoData.prazo,
                taxa_conclusao: projetoData.taxaConclusao
            };

            console.log('Gerando gráfico com os dados:', dadosParaEnviar);

            const response = await fetch(`${BACKEND_URL}/gerar-grafico`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Erro ao gerar gráfico: ${errorData}`);
            }

            const resultado = await response.json();
            console.log('Gráfico gerado:', resultado);
            
            // Extrair o nome do arquivo do caminho
            const filename = resultado.file_path.split('/').pop();
            
            // Fazer download do arquivo
            const downloadUrl = `${BACKEND_URL}/download-grafico/${filename}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert('Gráfico gerado e download iniciado!');
            
        } catch (error) {
            console.error('Erro ao gerar gráfico:', error);
            alert(`Erro ao gerar gráfico: ${error.message}`);
        } finally {
            setGerandoGrafico(false);
        }
    }
}
export default Avaliacao;