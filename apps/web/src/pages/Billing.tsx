import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Medicine {
    id: number;
    name: string;
    mrp: number;
    stock: number;
}

interface CartItem {
    medicineId: number;
    medicineName: string;
    mrp: number;
    quantity: number;
}

export const Billing: React.FC = () => {
    useAuth();
    const queryClient = useQueryClient();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedMedId, setSelectedMedId] = useState<number>(0);
    const [qty, setQty] = useState<number>(1);
    const [showInvoice, setShowInvoice] = useState<any>(null);

    // Fetch medicines
    const { data: medicines } = useQuery({
        queryKey: ['medicines', 'billing'],
        queryFn: async () => {
            const res = await client.get('/medicines');
            return res.data as Medicine[];
        }
    });

    // Create transaction mutation
    const transactionMutation = useMutation({
        mutationFn: async (items: { medicineId: number, quantity: number }[]) => {
            return await client.post('/billing', { items });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['medicines'] });
            setCart([]);
            setShowInvoice(data.data);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Transaction failed');
        }
    });

    const addToCart = () => {
        if (!selectedMedId) return;
        const med = medicines?.find(m => m.id === Number(selectedMedId));
        if (!med) return;

        if (med.stock < qty) {
            alert(`Insufficient stock. Only ${med.stock} available.`);
            return;
        }

        const existingItem = cart.find(item => item.medicineId === med.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.medicineId === med.id
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            ));
        } else {
            setCart([...cart, {
                medicineId: med.id,
                medicineName: med.name,
                mrp: med.mrp,
                quantity: qty
            }]);
        }
        setSelectedMedId(0);
        setQty(1);
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.medicineId !== id));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        const items = cart.map(item => ({
            medicineId: item.medicineId,
            quantity: item.quantity
        }));
        transactionMutation.mutate(items);
    };

    const printReceipt = () => {
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) return;

        const html = `
            <html>
            <head>
                <style>
                    body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 10px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 3px; }
                    .totals { margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h3>Pharmacy App</h3>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <p>Tx ID: #${showInvoice.id}</p>
                </div>
                <div>
                    ${showInvoice.items.map((item: any) => `
                        <div class="item">
                            <span>${item.medicineName} x${item.quantity}</span>
                            <span>$${item.total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="totals">
                    <div class="item" style="font-weight: bold;">
                        <span>TOTAL</span>
                        <span>$${showInvoice.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                <div class="footer">
                    <p>Thank you for your business!</p>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        receiptWindow.document.write(html);
        receiptWindow.document.close();
    };

    if (showInvoice) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                    <p className="text-slate-500 mb-6">Transaction ID: #{showInvoice.id}</p>

                    <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
                        {showInvoice.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm py-1">
                                <span>{item.medicineName} x{item.quantity}</span>
                                <span className="font-medium">${item.total.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold text-slate-800">
                            <span>Total</span>
                            <span>${showInvoice.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={printReceipt}
                            className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Receipt
                        </button>
                        <button
                            onClick={() => setShowInvoice(null)}
                            className="flex-1 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500"
                        >
                            New Sale
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <h1 className="text-3xl font-bold text-slate-800">POS & Billing</h1>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex gap-4 mb-6">
                            <select
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg outline-none"
                                value={selectedMedId}
                                onChange={e => setSelectedMedId(Number(e.target.value))}
                            >
                                <option value={0}>Select Medicine</option>
                                {medicines?.map(m => (
                                    <option key={m.id} value={m.id} disabled={m.stock === 0}>
                                        {m.name} - ${m.mrp} ({m.stock} in stock)
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                className="w-24 px-4 py-3 border border-slate-300 rounded-lg outline-none"
                                value={qty}
                                onChange={e => setQty(Number(e.target.value))}
                            />
                            <button
                                onClick={addToCart}
                                disabled={!selectedMedId}
                                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {medicines?.slice(0, 6).map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setSelectedMedId(m.id); setQty(1); }}
                                    disabled={m.stock === 0}
                                    className={`p-4 rounded-lg border text-left transition-all ${selectedMedId === m.id
                                        ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                                        : 'border-slate-200 hover:border-sky-300'
                                        }`}
                                >
                                    <div className="font-bold text-slate-800">{m.name}</div>
                                    <div className="text-sm text-slate-500">${m.mrp}</div>
                                    <div className={`text-xs mt-2 ${m.stock === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {m.stock} available
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart / Invoice */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Current Sale</h2>

                    <div className="space-y-4 mb-6 min-h-[300px]">
                        {cart.length === 0 ? (
                            <div className="text-center text-slate-400 py-12">
                                Cart is empty
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group">
                                    <div>
                                        <div className="font-medium text-slate-800">{item.medicineName}</div>
                                        <div className="text-xs text-slate-500">${item.mrp} x {item.quantity}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-700">
                                            ${(item.mrp * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.medicineId)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-4">
                        <div className="flex justify-between text-lg font-bold text-slate-800">
                            <span>Total Amount</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-500 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            Complete Sale
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
