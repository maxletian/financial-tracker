import { GoogleGenAI } from "@google/genai";
import { Transaction, Budget, FinancialReport } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not set via environment variables.");
    // In a real app, handle this gracefully. For this demo, we assume it's there.
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFinancialReport = async (
  transactions: Transaction[],
  budget: Budget,
  month: string
): Promise<FinancialReport | null> => {
  try {
    const ai = getAIClient();
    
    // Filter transactions for the specific month to save context
    const prompt = `
      You are a financial advisor. 
      Generate a structured JSON financial report for the user based on the following data.
      The user's monthly budget is ${budget.limit}.
      
      Transactions:
      ${JSON.stringify(transactions)}
      
      Current Date Context: ${new Date().toISOString()}
      Requested Report Month: ${month}
      
      Return ONLY valid JSON with this structure:
      {
        "summary": "A 2-3 sentence executive summary of their financial health.",
        "totalIncome": number,
        "totalExpense": number,
        "netSavings": number,
        "breakdown": [
            { "category": "Food", "amount": 100, "percentage": "10%" }
        ],
        "tips": ["Tip 1", "Tip 2", "Tip 3"],
        "status": "Under Budget" | "Near Budget" | "Over Budget"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as FinancialReport;
  } catch (error) {
    console.error("Error generating report:", error);
    return null;
  }
};

export const checkBudgetHealth = async (
  totalExpense: number,
  budgetLimit: number
): Promise<string> => {
    try {
        const ai = getAIClient();
        const prompt = `
            The user has spent ${totalExpense} out of their ${budgetLimit} budget.
            Provide a 1-sentence quick alert or compliment. 
            If over budget, be urgent. If close, be cautionary. If under, be congratulatory.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "";
    } catch (e) {
        return "";
    }
}