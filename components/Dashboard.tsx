import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, Budget } from '../types';
import { Wallet, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budget: Budget;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, budget }) => {
  
  const { totalIncome, totalExpense, expenseByCategory, incomeVsExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });

    const pieData = Object.keys(catMap).map(name => ({ name, value: catMap[name] }));
    const barData = [
      { name: 'Financials', Income: income, Expense: expense }
    ];

    return { totalIncome: income, totalExpense: expense, expenseByCategory: pieData, incomeVsExpense: barData };
  }, [transactions]);

  const budgetUsage = Math.min((totalExpense / budget.limit) * 100, 100);
  const isOverBudget = totalExpense > budget.limit;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Income</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm">
          <div className="flex items-center space-x-2 text-rose-600 mb-1">
            <TrendingDown size={18} />
            <span className="text-sm font-medium">Expense</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">${totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* Budget Status */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Monthly Budget</h3>
            <p className="text-xl font-bold text-gray-800">
                ${totalExpense.toLocaleString()} <span className="text-gray-400 text-sm font-normal">/ ${budget.limit.toLocaleString()}</span>
            </p>
          </div>
          {isOverBudget && (
             <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                <AlertTriangle size={16} className="mr-1" />
                <span className="text-xs font-bold">Exceeded</span>
             </div>
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : (budgetUsage > 80 ? 'bg-amber-400' : 'bg-blue-500')}`}
            style={{ width: `${budgetUsage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">
            {isOverBudget ? "You have exceeded your budget targets." : `${(100 - budgetUsage).toFixed(1)}% remaining`}
        </p>
      </div>

      {/* Charts */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-4 flex items-center">
            <Wallet size={18} className="mr-2 text-blue-500" /> Spending Breakdown
        </h3>
        <div className="h-64 w-full">
            {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `$${value}`} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    No expense data yet
                </div>
            )}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-4">Income vs Expense</h3>
        <div className="h-56 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpense} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
