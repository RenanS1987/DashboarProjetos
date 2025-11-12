import React from 'react';

// O componente espera totalSaldo, status de carregamento e a função onClearData como props
function ExcelReader({ totalSaldo, isDataLoaded, loadingError, onClearData }) {

    // Função utilitária para formatar o valor como moeda (Real Brasileiro)
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Handler para zerar os dados
    const handleClear = () => {
        // Chama a função no App.jsx que zera os valores de saldo e prazo
        onClearData();
    };

    return (
        <div style={{
            // 1. LARGURA: 50% do container pai e centralizado
            width: '50%',
            margin: '10px auto', // Reduzida a margem vertical

            // 2. ALTURA: Reduzida via padding
            padding: '10px 20px', // Reduzido o padding vertical de 20px para 10px

            border: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#191970',
            color: 'white',
            minHeight: '80px' // Garante que o bloco não colapse
        }}>
            <div>
                {/* Título: Margem padrão removida para diminuir altura */}
                <h3 style={{ margin: 0, fontSize: '1.2em' }}>SALDO GERAL DE CONVÊNIOS</h3>

                {/* Feedback de carregamento/erro */}
                {!isDataLoaded && <p style={{ color: 'lightblue', margin: '5px 0' }}>Carregando dados...</p>}
                {loadingError && <p style={{ color: 'red', margin: '5px 0' }}>Erro: {loadingError}</p>}

                {/* BLOCO DO SALDO TOTAL */}
                {isDataLoaded && !loadingError && (
                    <div style={{
                        marginTop: '5px', // Margem superior reduzida
                        padding: '5px 10px', // Padding interno reduzido
                        backgroundColor: '#36454F',
                        border: '1px solid #82ca9d',
                        borderRadius: '5px'
                    }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1em', color: '#FFFFFF', margin: 0 }}>
                            {/* Tamanho da fonte e margem de parágrafo reduzidos */}
                            Total Geral: {formatCurrency(totalSaldo)}
                        </p>
                    </div>
                )}

                {isDataLoaded && !loadingError && <p style={{ color: '#82ca9d', marginTop: '5px', fontSize: '0.8em', margin: 0 }}>Dados carregados com sucesso!</p>}

            </div>

            {/* Botão de Limpar (Zerar) */}
            {isDataLoaded && !loadingError && (
                <button
                    onClick={handleClear}
                    style={{
                        padding: '8px 15px', // Padding do botão reduzido
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                    }}
                >
                    Zerar Valores no Gráfico
                </button>
            )}
        </div>
    );
}

export default ExcelReader;