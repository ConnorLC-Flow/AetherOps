'use client';

import { CostChart, CostByProviderChart } from '@/components/charts/CostChart';
import { ForecastingChart } from '@/components/charts/ForecastingChart';
import { Download, Calendar, Filter, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function CostsPage() {
  const { data: costsBreakdown, isLoading } = useQuery({
    queryKey: ['costs-breakdown'],
    queryFn: async () => {
      try {
        const response = await api.get('/costs/breakdown');
        return response.data;
      } catch (err) {
        console.error("Failed to fetch costs breakdown", err);
        return null;
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze historical spend and view data-driven financial projections for your software stack.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 text-xs">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm" className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Spend (MTD)</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900">$12,450.00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs font-semibold text-red-600">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              <span>+12.5% vs LW</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Projected Run Rate</CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-600">$158,200.00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs font-semibold text-slate-500">
              <BarChart3 className="mr-1 h-3.5 w-3.5 text-indigo-500" />
              <span>Based on current stack</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Unused Seat Value</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">$1,840.00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingDown className="mr-1 h-3.5 w-3.5" />
              <span>Savings opportunity</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Budget Remaining</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-900">$4,250.00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs font-semibold text-emerald-600">
              <CheckCircle2 size={14} className="mr-1" />
              <span>On Track</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Spend Forecasting</CardTitle>
            <CardDescription>Visualizing 6-month projections based on historical data and expansion plans</CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">AI Predicted</Badge>
        </CardHeader>
        <CardContent>
          <ForecastingChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Spend Over Time</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <CostChart />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Spend by Provider</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <CostByProviderChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckCircle2({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
