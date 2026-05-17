'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { budgetAPI, mockBudgetStatus, mockCategoryBreakdown } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AlertTriangle, Save } from 'lucide-react';

export default function BudgetPage() {
  const [budget, setBudget] = useState(mockBudgetStatus);
  const [monthlyLimit, setMonthlyLimit] = useState(mockBudgetStatus.budget.monthlyLimit);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [isSaving, setIsSaving] = useState(false);

  const COLORS = ['#8E1B3A', '#B76E79', '#D4969F', '#A0A0A0', '#6D071A'];

  const categoryData = mockCategoryBreakdown.map((cat) => ({
    ...cat,
    displayAmount: cat.amount.replace('$', ''),
  }));

  const handleSaveBudget = async () => {
    setIsSaving(true);
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      await budgetAPI.setBudget(monthlyLimit, alertThreshold, year, month);
      setBudget({
        ...budget,
        budget: { monthlyLimit },
      });
    } catch (error) {
      console.error('Failed to save budget:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isNearLimit = budget.percentage >= alertThreshold;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget Control</h1>
          <p className="text-white/60">Monitor and manage your monthly spending budget.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-white/60 text-sm font-medium mb-2">Monthly Limit</p>
            <h3 className="text-3xl font-bold text-white">${monthlyLimit.toLocaleString()}</h3>
          </div>
          <div className="glass-card p-6">
            <p className="text-white/60 text-sm font-medium mb-2">Current Spending</p>
            <h3 className="text-3xl font-bold text-[#B76E79]">${budget.currentSpending.toLocaleString()}</h3>
            <p className="text-white/60 text-sm mt-2">as of today</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-white/60 text-sm font-medium mb-2">Remaining Budget</p>
            <h3 className="text-3xl font-bold text-green-400">${budget.remaining.toLocaleString()}</h3>
            <p className="text-white/60 text-sm mt-2">{((budget.remaining / monthlyLimit) * 100).toFixed(1)}% available</p>
          </div>
        </div>

        {/* Alert Banner */}
        {isNearLimit && (
          <div className="glass-card p-4 border border-amber-500/30 bg-amber-500/10 flex items-start gap-4">
            <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="text-amber-400 font-bold">Warning: Budget Capacity Nearing Exhaustion</h3>
              <p className="text-amber-300/80 text-sm mt-1">You have used {budget.percentage.toFixed(1)}% of your monthly budget. Consider reviewing upcoming expenses.</p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Saturation Ring */}
          <div className="glass-card p-8">
            <h2 className="text-lg font-bold text-white mb-4">Budget Usage</h2>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Used', value: budget.percentage },
                      { name: 'Remaining', value: 100 - budget.percentage },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill={isNearLimit ? '#EF4444' : '#B76E79'} />
                    <Cell fill="#3A0A14" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <h3 className="text-3xl font-bold text-white mt-4">{budget.percentage.toFixed(1)}%</h3>
              <p className="text-white/60 text-sm">Budget Used</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Expense Breakdown by Category</h2>
            <div className="space-y-4">
              {categoryData.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{cat.name}</span>
                    <span className="text-white/60 text-sm">{cat.amount}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${cat.value}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Settings */}
        <div className="glass-card p-8">
          <h2 className="text-lg font-bold text-white mb-6">Budget Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">Monthly Limit ($)</label>
              <input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                className="glass-input w-full text-lg"
              />
              <p className="text-white/40 text-xs mt-2">Set your maximum monthly spending allowance</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-3">Alert Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="glass-input w-full text-lg"
              />
              <p className="text-white/40 text-xs mt-2">Alert when spending reaches this percentage</p>
            </div>
          </div>

          <button
            onClick={handleSaveBudget}
            disabled={isSaving}
            className="btn-rose-gold mt-6 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Budget Settings'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
