import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Componente auxiliar para renderizar um gráfico individual
const SingleBarChart = ({ data, xAxisKey, barKey, title, barColor, nameKey }) => (
    <div style={{
        width: '49%',
        height: 350,
        border: '1px solid #eee',
        padding: '10px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        color: 'black',
        borderRadius: '8px'
    }}>
        <h4 style={{ color: 'black' }}>{title}</h4>
        <ResponsiveContainer width="100%" height="90%">
            <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                {/* --- ALTERAÇÃO: MANTER dataKey, MAS ESCONDER VISUALMENTE --- */}
                <XAxis
                    dataKey={xAxisKey} // MANTIDO: ESSENCIAL PARA O TOOLTIP FUNCIONAR
                    stroke="black"
                    axisLine={false} // Remove a linha principal do eixo
                    tickLine={false} // Remove os pequenos traços de tick
                    tick={false}     // Remove os rótulos (nomes dos convênios)
                />
                {/* --- FIM DA ALTERAÇÃO --- */}

                <YAxis stroke="black" />
                {/* Tooltip agora pode usar a dataKey que está no XAxis */}
                <Tooltip />

                <Bar dataKey={barKey} fill={barColor} name={nameKey} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

function DashboardChart({ chartDataSaldo, chartDataPrazo, isDataLoaded }) {
    if (!isDataLoaded) {
        return <p style={{ marginTop: '10px' }}>Aguardando o carregamento dos dados ou os dados foram zerados.</p>;
    }

    return (
        <div style={{ marginTop: '15px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>

                {/* GRÁFICO 1: Saldo dos Convênios */}
                <SingleBarChart
                    data={chartDataSaldo}
                    xAxisKey="convenio" // Necessário para o Tooltip
                    barKey="saldo"
                    nameKey="Saldo (R$)"
                    title="Saldo (R$) por Convênio"
                    barColor="#82ca9d"
                />

                {/* GRÁFICO 2: Prazo dos Convênios */}
                <SingleBarChart
                    data={chartDataPrazo}
                    xAxisKey="convenio" // Necessário para o Tooltip
                    barKey="prazo"
                    nameKey="Prazo (meses)"
                    title="Prazo Médio (Meses) por Convênio"
                    barColor="#8884d8"
                />

            </div>
        </div>
    );
}

export default DashboardChart;