import React, { useState } from 'react';
import { Transaction, Budget, UserSettings, FinancialReport } from '../types';
import { generateFinancialReport } from '../services/geminiService';
import { Sparkles, Mail, Loader2, FileText, CheckCircle, BarChart2, AlertCircle, PieChart as PieChartIcon, X, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface SmartAdvisorProps {
  transactions: Transaction[];
  budget: Budget;
  userSettings: UserSettings;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'];

export const SmartAdvisor: React.FC<SmartAdvisorProps> = ({ transactions, budget, userSettings }) => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const handleGenerateReport = async () => {
    setLoading(true);
    // Determine the current month name
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const result = await generateFinancialReport(transactions, budget, currentMonth);
    setReport(result);
    setLoading(false);
  };

  const handleSendEmail = () => {
    setShowEmailModal(true);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Under Budget': return 'text-emerald-600 bg-emerald-50';
          case 'Near Budget': return 'text-amber-600 bg-amber-50';
          case 'Over Budget': return 'text-rose-600 bg-rose-50';
          default: return 'text-gray-600 bg-gray-50';
      }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
            <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <Sparkles className="mr-2 text-yellow-300" /> Smart Advisor
                </h2>
                <p className="text-indigo-100 text-sm opacity-90">
                    Get AI-powered insights, spending graphs, and detailed tables sent directly to your email.
                </p>
            </div>
        </div>
        
        <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="mt-6 w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center"
        >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" />}
            {loading ? "Analyzing Financials..." : "Generate Monthly Report"}
        </button>
      </div>

      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Monthly Analysis</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${getStatusColor(report.status)}`}>
                            {report.status}
                        </span>
                    </div>
                    <button 
                        onClick={handleSendEmail}
                        className="text-indigo-600 text-sm font-semibold flex items-center hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors border border-indigo-100"
                    >
                        <Mail size={16} className="mr-1" /> Email Report
                    </button>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed italic mb-4">
                    "{report.summary}"
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-emerald-50 p-2 rounded-lg text-center">
                        <div className="flex justify-center text-emerald-600 mb-1"><TrendingUp size={16}/></div>
                        <p className="text-xs text-gray-500">Income</p>
                        <p className="font-bold text-emerald-700 text-sm">${report.totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg text-center">
                        <div className="flex justify-center text-rose-600 mb-1"><TrendingDown size={16}/></div>
                        <p className="text-xs text-gray-500">Expenses</p>
                        <p className="font-bold text-rose-700 text-sm">${report.totalExpense.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <div className="flex justify-center text-blue-600 mb-1"><PiggyBank size={16}/></div>
                        <p className="text-xs text-gray-500">Savings</p>
                        <p className="font-bold text-blue-700 text-sm">${report.netSavings.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Graph Section */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <BarChart2 size={14} className="mr-1" /> Expense Visualization
                    </h4>
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                        <button 
                            onClick={() => setChartType('bar')}
                            className={`p-1 rounded ${chartType === 'bar' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                        >
                            <BarChart2 size={16} />
                        </button>
                        <button 
                            onClick={() => setChartType('pie')}
                            className={`p-1 rounded ${chartType === 'pie' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                        >
                            <PieChartIcon size={16} />
                        </button>
                    </div>
                </div>
                
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={report.breakdown as any[]} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="category" tick={{fontSize: 10}} interval={0} />
                                <YAxis tick={{fontSize: 10}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {report.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={report.breakdown as any[]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="amount"
                                    nameKey="category"
                                >
                                    {report.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value}`} />
                                <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Section */}
            <div className="p-6">
                <h4 className="text-xs font-bold text-gray-50 uppercase tracking-wider mb-4">Detailed Breakdown</h4>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                            <tr>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-right">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {report.breakdown.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800 flex items-center">
                                        <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                                        {item.category}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">${item.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-gray-500 font-mono text-xs">{item.percentage}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold text-gray-800 bg-gray-50">
                            <tr>
                                <td className="px-4 py-3">Total</td>
                                <td className="px-4 py-3 text-right">${report.totalExpense.toLocaleString()}</td>
                                <td className="px-4 py-3 rounded-r-lg"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 bg-indigo-50 border-t border-indigo-100">
                <h4 className="text-indigo-800 font-bold mb-3 flex items-center">
                    <Sparkles size={16} className="mr-2" /> AI Recommendations
                </h4>
                <ul className="space-y-2">
                    {report.tips.map((tip, i) => (
                        <li key={i} className="flex items-start text-sm text-indigo-900 bg-white p-3 rounded-lg shadow-sm border border-indigo-100">
                            <span className="mr-2 text-indigo-500">•</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      )}

      {/* Placeholder if no report */}
      {!report && !loading && (
          <div className="text-center py-10 opacity-50">
              <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart2 className="text-gray-500" size={32} />
              </div>
              <p className="text-gray-500 text-sm">Tap generate to analyze your {transactions.length} transactions.</p>
          </div>
      )}
      
      {/* Email Preview Modal */}
      {showEmailModal && report && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
               <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                    <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
                        <h3 className="font-bold flex items-center text-sm"><Mail size={16} className="mr-2"/> Email Simulation</h3>
                        <button onClick={() => setShowEmailModal(false)} className="hover:bg-gray-700 rounded-full p-1"><X size={18}/></button>
                    </div>
                    <div className="p-5">
                        <div className="mb-4 text-xs text-gray-600 border-b border-gray-100 pb-3 space-y-1">
                            <p className="flex justify-between">
                                <span className="font-semibold text-gray-400">To:</span> 
                                <span>{userSettings.email}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="font-semibold text-gray-400">Subject:</span> 
                                <span>Your Monthly Financial Report</span>
                            </p>
                        </div>
                        
                        {/* Fake Email Body */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 space-y-3 font-serif leading-relaxed">
                            <p>Hi there,</p>
                            <p>Here is your financial summary for this month:</p>
                            <p className="italic border-l-2 border-indigo-300 pl-3 text-gray-600">"{report.summary}"</p>
                            
                            <div className="my-3">
                                <p className="font-bold border-b border-gray-200 pb-1 mb-2">Breakdown</p>
                                {report.breakdown.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs mb-1">
                                        <span>{item.category}</span>
                                        <span>${item.amount}</span>
                                    </div>
                                ))}
                                {report.breakdown.length > 3 && <p className="text-xs text-gray-400 italic">+ {report.breakdown.length - 3} more categories...</p>}
                            </div>

                            <p className="font-bold mt-2">Status: <span className={`${getStatusColor(report.status)} bg-transparent px-0`}>{report.status}</span></p>
                            
                            <p className="mt-4 text-xs text-gray-500">
                                This is an automated message from FinTrack AI.
                            </p>
                        </div>

                        <div className="mt-5 flex items-start p-3 bg-yellow-50 text-yellow-800 rounded-lg text-xs">
                            <AlertCircle size={16} className="mr-2 shrink-0 mt-0.5"/>
                            <p>This is a demo application. In a real production environment, this email would be sent via a backend service (e.g., SendGrid, AWS SES).</p>
                        </div>

                        <button onClick={() => setShowEmailModal(false)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
                            Close Preview
                        </button>
                    </div>
               </div>
          </div>
      )}
    </div>
  );
};