import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const Reports: React.FC = () => {
    const { data: report, isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: async () => {
            const res = await client.get('/reports');
            return res.data;
        }
    });

    if (isLoading) return <div className="p-8">Loading reports...</div>;

    const chartData = {
        labels: report?.topMedicines?.map((m: any) => m.name),
        datasets: [
            {
                label: 'Units Sold',
                data: report?.topMedicines?.map((m: any) => m.qty),
                backgroundColor: 'rgba(14, 165, 233, 0.5)',
                borderColor: 'rgb(14, 165, 233)',
                borderWidth: 1,
            }
        ]
    };

    const printReport = () => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) return;

        const html = `
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 10px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px; }
                    .section { margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    h3 { margin: 5px 0; font-size: 14px; text-transform: uppercase; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h3>Pharmacy App</h3>
                    <h4>EOD REPORT</h4>
                    <p>${new Date().toLocaleString()}</p>
                </div>
                
                <div class="section">
                    <h3>Summary</h3>
                    <div class="item">
                        <span>Total Revenue:</span>
                        <span>$${report?.totalSales.toFixed(2)}</span>
                    </div>
                    <div class="item">
                        <span>Transactions:</span>
                        <span>${report?.transactionCount}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Top Items</h3>
                    ${report?.topMedicines?.map((m: any) => `
                        <div class="item">
                            <span>${m.name}</span>
                            <span>${m.qty} sold</span>
                        </div>
                    `).join('')}
                </div>

                <div class="section">
                    <h3>Inventory Alerts</h3>
                    <div class="item">
                        <span>Low Stock Items:</span>
                        <span>${report?.lowStockCount}</span>
                    </div>
                </div>

                 <div style="text-align: center; margin-top: 20px;">
                    <p>*** END OF REPORT ***</p>
                </div>
                
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        reportWindow.document.write(html);
        reportWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
                    <button
                        onClick={printReport}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print POS Report
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Sales Revenue</div>
                        <div className="text-3xl font-bold text-slate-800">${report?.totalSales.toFixed(2)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Transactions</div>
                        <div className="text-3xl font-bold text-slate-800">{report?.transactionCount}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Low Stock Alerts</div>
                        <div className={`text-3xl font-bold ${report?.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {report?.lowStockCount}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Top Selling Medicines</h2>
                        {report?.topMedicines.length > 0 ? (
                            <Bar options={{ responsive: true }} data={chartData} />
                        ) : (
                            <p className="text-slate-400 text-center py-8">No sales data available yet.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Transactions</h2>
                        <div className="space-y-4">
                            {report?.recentTransactions.map((t: any) => (
                                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <div>
                                        <div className="font-semibold text-slate-700">Order #{t.id}</div>
                                        <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="font-bold text-emerald-600">
                                        +${t.totalAmount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            {report?.recentTransactions.length === 0 && (
                                <p className="text-slate-400 text-center py-8">No transactions yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
