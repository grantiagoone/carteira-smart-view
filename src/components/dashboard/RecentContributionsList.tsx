
import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface RecentContributionsListProps {
  portfolioId?: string | null;
}

const RecentContributionsList = ({ portfolioId }: RecentContributionsListProps) => {
  // Mock data - In a real app, this would come from your API based on the portfolio ID
  const contributions = [
    {
      id: '1',
      date: '15/04/2025',
      amount: 1000.00,
      portfolio: 'Carteira Principal',
      portfolioId: '1',
      allocations: [
        { name: 'Ações', percentage: 40, ticker: 'PETR4', amount: 400.00 },
        { name: 'FIIs', percentage: 30, ticker: 'HGLG11', amount: 300.00 },
        { name: 'Renda Fixa', percentage: 30, ticker: 'Tesouro Selic 2029', amount: 300.00 },
      ]
    },
    {
      id: '2',
      date: '15/03/2025',
      amount: 800.00,
      portfolio: 'Carteira Principal',
      portfolioId: '1',
      allocations: [
        { name: 'Ações', percentage: 40, ticker: 'ITUB4', amount: 320.00 },
        { name: 'FIIs', percentage: 30, ticker: 'XPLG11', amount: 240.00 },
        { name: 'Renda Fixa', percentage: 30, ticker: 'CDB Nubank', amount: 240.00 },
      ]
    },
    {
      id: '3',
      date: '15/02/2025',
      amount: 900.00,
      portfolio: 'Carteira Dividendos',
      portfolioId: '2',
      allocations: [
        { name: 'Ações', percentage: 60, ticker: 'TAEE11', amount: 540.00 },
        { name: 'FIIs', percentage: 40, ticker: 'MXRF11', amount: 360.00 },
      ]
    }
  ];

  // Filter contributions if portfolio ID is provided
  const filteredContributions = portfolioId 
    ? contributions.filter(c => c.portfolioId === portfolioId)
    : contributions;

  if (filteredContributions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum aporte recente encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredContributions.map((contribution) => (
        <div key={contribution.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-medium">{contribution.date}</p>
              <p className="text-sm text-muted-foreground">{contribution.portfolio}</p>
            </div>
            <p className="font-semibold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contribution.amount)}
            </p>
          </div>
          <div className="space-y-2 mt-3">
            {contribution.allocations.map((allocation, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1 border-t border-gray-200">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                  <span>{allocation.name} - {allocation.ticker}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 text-muted-foreground">{allocation.percentage}%</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(allocation.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <button className="flex items-center text-sm text-primary hover:underline">
              Ver detalhes
              <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentContributionsList;
