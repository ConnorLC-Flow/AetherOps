'use client';

import { 
  Database, 
  BarChart3, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { useAlerts } from '@/lib/hooks/useAlerts';
import api from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { alerts, isLoading: alertsLoading, dismiss: dismissAlert } = useAlerts();

  const { data: inventory, error: inventoryError } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => (await api.get('/inventory/')).data,
  });

  const { data: costs, error: costsError } = useQuery({
    queryKey: ['costs-breakdown'],
    queryFn: async () => (await api.get('/costs/breakdown')).data,
  });

  const { data: policies, error: policiesError } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => (await api.get('/policies/')).data,
  });

  const { data: recommendations, error: recommendationsError } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await api.get('/recommendations/')).data,
  });

  const hasError = inventoryError || costsError || policiesError || recommendationsError;

  const stats = [
    { 
      name: 'Total AI Assets', 
      value: inventory?.length?.toString() || '0', 
      icon: Database, 
      change: '+2', 
      changeType: 'increase' 
    },
    { 
      name: 'Total Spend', 
      value: costs ? `$${costs.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0).toLocaleString()}` : '$0', 
      icon: BarChart3, 
      change: '+12.5%', 
      changeType: 'increase' 
    },
    { 
      name: 'Active Policies', 
      value: policies?.filter((p: any) => p.is_enabled).length?.toString() || '0', 
      icon: ShieldCheck, 
      change: '0', 
      changeType: 'neutral' 
    },
    { 
      name: 'Recommendations', 
      value: recommendations?.filter((r: any) => r.status === 'OPEN').length?.toString() || '0', 
      icon: Zap, 
      change: recommendations?.length?.toString() || '0', 
      changeType: 'increase' 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back. Here is what's happening with your AI fleet today.
        </p>
      </div>

      {hasError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          <p className="font-semibold">Unable to reach backend — showing cached or default data</p>
          <p className="mt-1 opacity-80">Please check if the backend service is running on port 8000.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn(
                "text-xs font-semibold mt-1",
                stat.changeType === 'increase' ? 'text-emerald-600' : 
                stat.changeType === 'decrease' ? 'text-rose-600' : 'text-slate-500'
              )}>
                {stat.change}
                {stat.change && <span className="text-muted-foreground font-normal ml-1">from last period</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Governance Alerts</CardTitle>
            </div>
            <CardDescription>Recent policy violations and critical notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : alerts.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">No active alerts.</p>
              ) : alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.source_tool && <span className="font-semibold mr-2">{alert.source_tool}</span>}
                      {new Date(alert.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={
                      alert.severity === 'CRITICAL' ? 'destructive' :
                      alert.severity === 'WARNING' ? 'secondary' : 'outline'
                    } className="capitalize">
                      {alert.severity.toLowerCase()}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Insights */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg">Optimization Insights</CardTitle>
            </div>
            <CardDescription>AI-driven suggestions to reduce spend and improve performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!recommendations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recommendations.filter((r: any) => r.status === 'OPEN').slice(0, 2).map((rec: any) => (
              <div key={rec.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="h-12 w-12 text-indigo-600" />
                </div>
                <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                  {rec.description}
                </p>
                <Link href="/recommendations" passHref>
                  <Button variant="link" className="px-0 h-auto mt-2 text-indigo-600 font-bold uppercase tracking-widest text-[10px]">
                    Review Implementation <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
            {recommendations?.filter((r: any) => r.status === 'OPEN').length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-8">No open recommendations.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
