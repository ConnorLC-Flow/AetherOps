'use client';

import { CostChart, CostByProviderChart } from '@/components/charts/CostChart';
import { Download, Calendar, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cost Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and analyze your organization's AI spend across all providers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Spend (MTD)</CardDescription>
            <CardTitle className="text-3xl font-bold">$12,450.00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-medium text-red-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+12.5%</span>
              <span className="ml-2 text-muted-foreground font-normal text-xs">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Tokens Consumed</CardDescription>
            <CardTitle className="text-3xl font-bold">142.5M</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-medium text-emerald-600">
              <TrendingDown className="mr-1 h-4 w-4" />
              <span>-2.1%</span>
              <span className="ml-2 text-muted-foreground font-normal text-xs">efficiency improvement</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Avg. Cost per 1k Tokens</CardDescription>
            <CardTitle className="text-3xl font-bold">$0.0087</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm font-medium text-blue-600">
              <Minus className="mr-1 h-4 w-4" />
              <span>Stable</span>
              <span className="ml-2 text-muted-foreground font-normal text-xs">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
