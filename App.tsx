import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Bot, 
  Settings, 
  Bell, 
  X, 
  Save 
} from 'lucide-react';
import { Transaction, Budget, UserSettings, ViewState, CATEGORIES } from './types';
import { Dashboard } from './components/Dashboard';
import { SmartAdvisor } from './components/SmartAdvisor';
import { checkBudgetHealth } from './services/geminiService';

export default function App() {
  // --- State ---
  const [view, setView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [budget, setBudget] = useState<Budget>(() => {
    const saved = localStorage.getItem('budget');
    return saved ? JSON.parse(saved) : { limit: 2000, alertThreshold: 80 };
  });
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email: 'user@example.com',
    currency: 'USD'
  });
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for adding transaction
  const [newTransAmount, setNewTransAmount] = useState('');
  const [newTransCategory, setNewTransCategory] = useState(CATEGORIES.expense[0]);
  const [newTransType, setNewTransType] = useState<'income' | 'expense'>('expense');
  const [newTransNote, setNewTransNote] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
  }, [budget]);

  // Check budget health when transactions change
  useEffect(() => {
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (totalExpense > budget.limit) {
      // Simulate sending email alert
      setNotification(`⚠️ ALERT: You have exceeded your budget of $${budget.limit}! An email has been sent to ${userSettings.email}.`);
    } else if (totalExpense > budget.limit * (budget.alertThreshold / 100)) {
        setNotification(`⚠️ Warning: You have reached ${budget.alertThreshold}% of your budget.`);
    } else {
        setNotification(null);
    }
  }, [transactions, budget, userSettings.email]);

  // --- Handlers ---
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransAmount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: newTransType,
      amount: parseFloat(newTransAmount),
      category: newTransCategory,
      date: new Date().toISOString(),
      note: newTransNote
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTransAmount('');
    setNewTransNote('');
    setNewTransCategory(newTransType === 'expense' ? CATEGORIES.expense[0] : CATEGORIES.income[0]);
  };

  const handleUpdateBudget = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const limit = parseFloat(formData.get('limit') as string);
      const email = formData.get('email') as string;
      
      setBudget(prev => ({ ...prev, limit }));
      setUserSettings(prev => ({ ...prev, email }));
      setIsSettingsOpen(false);
  };

  const deleteTransaction = (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
  }

  // --- Render Helpers ---

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budget={budget} />;
      case 'advisor':
        return <SmartAdvisor transactions={transactions} budget={budget} userSettings={userSettings} />;
      case 'history':
        return (
          <div className="pb-20 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Transaction History</h2>
            {transactions.length === 0 ? (
                <div className="text-center text-gray-400 py-10">No transactions yet.</div>
            ) : (
                transactions.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {t.type === 'income' ? <PlusCircle size={20} /> : <LayoutDashboard size={20} />}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{t.category}</p>
                                <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                            </p>
                            <button onClick={() => deleteTransaction(t.id)} className="text-xs text-red-400 mt-1">Delete</button>
                        </div>
                    </div>
                ))
            )}
          </div>
        );
      default:
        return <Dashboard transactions={transactions} budget={budget} />;
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative font-sans">
      
      {/* Top Navigation / Header */}
      <header className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div>
           <h1 className="text-xl font-extrabold text-indigo-600 tracking-tight">FinTrack<span className="text-gray-400 font-normal">.AI</span></h1>
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
          <Settings size={22} />
        </button>
      </header>

      {/* Notifications Overlay */}
      {notification && (
        <div className="bg-red-500 text-white text-xs px-4 py-2 text-center animate-pulse">
            {notification}
        </div>
      )}

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center absolute bottom-0 w-full z-20">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center space-y-1 ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center space-y-1 ${view === 'history' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <History size={24} />
          <span className="text-[10px] font-medium">History</span>
        </button>
        
        {/* Floating Add Button in Nav */}
        <div className="relative -top-6">
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
            >
                <PlusCircle size={28} />
            </button>
        </div>

        <button onClick={() => setView('advisor')} className={`flex flex-col items-center space-y-1 ${view === 'advisor' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Bot size={24} />
          <span className="text-[10px] font-medium">Advisor</span>
        </button>
        <button onClick={() => setIsSettingsOpen(true)} className={`flex flex-col items-center space-y-1 ${view === 'add' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Settings size={24} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:w-[90%] sm:rounded-2xl rounded-t-3xl p-6 animate-slide-up shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">New Transaction</h2>
                    <button onClick={() => setIsAddModalOpen(false)} className="bg-gray-100 p-2 rounded-full">
                        <X size={20} className="text-gray-500"/>
                    </button>
                </div>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                            type="button"
                            onClick={() => { setNewTransType('expense'); setNewTransCategory(CATEGORIES.expense[0]); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${newTransType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Expense
                        </button>
                        <button 
                             type="button"
                             onClick={() => { setNewTransType('income'); setNewTransCategory(CATEGORIES.income[0]); }}
                             className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${newTransType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Income
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input 
                                type="number" 
                                value={newTransAmount}
                                onChange={(e) => setNewTransAmount(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0.00"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                        <select 
                            value={newTransCategory}
                            onChange={(e) => setNewTransCategory(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                            {(newTransType === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Note (Optional)</label>
                        <input 
                            type="text" 
                            value={newTransNote}
                            onChange={(e) => setNewTransNote(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="What was this for?"
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center transition-colors">
                        <Save size={20} className="mr-2" /> Save Transaction
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                        <button onClick={() => setIsSettingsOpen(false)}><X size={20} className="text-gray-500"/></button>
                    </div>
                    <form onSubmit={handleUpdateBudget} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget Limit ($)</label>
                            <input 
                                name="limit"
                                type="number" 
                                defaultValue={budget.limit}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email for Reports</label>
                            <input 
                                name="email"
                                type="email" 
                                defaultValue={userSettings.email}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                We will send budget alerts and monthly reports here.
                            </p>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">
                            Save Changes
                        </button>
                    </form>
               </div>
          </div>
      )}

    </div>
  );
}
