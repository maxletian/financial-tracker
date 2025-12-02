import React, { useState } from 'react';
import { Transaction, Budget, UserSettings, FinancialReport } from '../types';
import { generateFinancialReport } from '../services/geminiService';
import { Sparkles, Mail, Loader2, FileText, CheckCircle, BarChart2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SmartAdvisorProps {
  transactions: Transaction[];
  budget: Budget;
  userSettings: UserSettings;
}

export const SmartAdvisor: React.FC<SmartAdvisorProps> = ({ transactions, budget, userSettings }) => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setSent(false);
    // Determine the current month name
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const result = await generateFinancialReport(transactions, budget, currentMonth);
    setReport(result);
    setLoading(false);
  };

  const handleSendEmail = () => {
    // Mock sending email
    setSent(true);
    // In a real app, this would call an API endpoint.
    // Since this is a demo, we simulate the success.
    setTimeout(() => {
        setSent(false); 
    }, 5000);
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
                    {!sent ? (
                        <button 
                            onClick={handleSendEmail}
                            className="text-indigo-600 text-sm font-semibold flex items-center hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors border border-indigo-100"
                        >
                            <Mail size={16} className="mr-1" /> Email Report
                        </button>
                    ) : (
                        <span className="text-green-600 text-xs font-semibold flex items-center bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                            <CheckCircle size={14} className="mr-1" /> Sent (Simulated)
                        </span>
                    )}
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed italic">
                    "{report.summary}"
                </p>
            </div>

            {/* Graph Section */}
            <div className="p-6 bg-gray-50 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                    <BarChart2 size={14} className="mr-1" /> Expense Visualization
                </h4>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.breakdown} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="category" tick={{fontSize: 10}} interval={0} />
                            <YAxis tick={{fontSize: 10}} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {report.breakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Section */}
            <div className="p-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Detailed Breakdown</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                            <tr>
                                <th className="px-3 py-2 rounded-l-lg">Category</th>
                                <th className="px-3 py-2 text-right">Amount</th>
                                <th className="px-3 py-2 text-right rounded-r-lg">% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.breakdown.map((item, index) => (
                                <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-3 font-medium text-gray-800">{item.category}</td>
                                    <td className="px-3 py-3 text-right text-gray-600">${item.amount.toLocaleString()}</td>
                                    <td className="px-3 py-3 text-right text-gray-500">{item.percentage}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold text-gray-800 bg-gray-50">
                            <tr>
                                <td className="px-3 py-3 rounded-l-lg">Total Expense</td>
                                <td className="px-3 py-3 text-right">${report.totalExpense.toLocaleString()}</td>
                                <td className="px-3 py-3 rounded-r-lg"></td>
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
      
      {sent && (
          <div className="fixed bottom-24 left-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-center text-sm z-50 animate-fade-in-up">
              <AlertCircle size={18} className="mr-2 text-yellow-400" />
              <span>Note: Email sending is simulated in this demo.</span>
          </div>
      )}
    </div>
  );
};