'use client';

import { Zap, ArrowRight, CheckCircle2, XCircle, DollarSign, Shield, Activity, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Recommendation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const mockRecommendations: Recommendation[] = [
  { id: '1', inventory_id: '2', category: 'COST', description: "Switch 'Customer Support Bot' from Claude-3-Opus to Claude-3-Haiku for routine queries. Historical analysis shows 85% of queries don't require the larger model.", potential_savings: 1200, status: 'OPEN' },
  { id: '2', inventory_id: '1', category: 'COST', description: "Consolidate 15 individual OpenAI Pro subscriptions into the Enterprise plan. This will provide better oversight and bulk pricing.", potential_savings: 450, status: 'OPEN' },
  { id: '3', inventory_id: '3', category: 'PERFORMANCE', description: "Enable prompt caching for 'Sales Research Agent'. This could reduce latency by 40% and costs by 25% for repetitive research tasks.", potential_savings: 150, status: 'IMPLEMENTED' },
  { id: '4', inventory_id: '5', category: 'SECURITY', description: "Deprecate 'Custom Llama 3' (v1) in favor of the newly released v2. v1 has known prompt injection vulnerabilities.", potential_savings: 0, status: 'DISMISSED' },
];

export default function RecommendationsPage() {
  const queryClient = useQueryClient();

  const { data: recommendations = mockRecommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ['recommendations'],
    queryFn: async () => {
      try {
        const response = await api.get('/recommendations/');
        return response.data;
      } catch (err) {
        console.error("Failed to fetch recommendations, using mock data", err);
        return mockRecommendations;
      }
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/recommendations/${id}/apply`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Optimization Recommendations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-driven suggestions to improve efficiency, security, and costs across your AI fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : recommendations.map((rec) => (
          <Card key={rec.id} className="overflow-hidden shadow-sm border-slate-200 hover:border-indigo-200 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    rec.category === 'COST' ? 'bg-emerald-50 text-emerald-600' :
                    rec.category === 'SECURITY' ? 'bg-rose-50 text-rose-600' :
                    'bg-sky-50 text-sky-600'
                  )}>
                    {rec.category === 'COST' ? <DollarSign size={24} /> :
                     rec.category === 'SECURITY' ? <Shield size={24} /> :
                     <Activity size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{rec.category} Optimization</h3>
                      <Badge variant={
                        rec.status === 'OPEN' ? 'default' : 
                        rec.status === 'IMPLEMENTED' ? 'secondary' : 
                        'outline'
                      } className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        rec.status === 'OPEN' && "bg-indigo-600 hover:bg-indigo-700",
                        rec.status === 'IMPLEMENTED' && "bg-emerald-100 text-emerald-800 border-transparent",
                        rec.status === 'DISMISSED' && "bg-slate-100 text-slate-600 border-transparent"
                      )}>
                        {rec.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{rec.description}</p>
                    {rec.potential_savings > 0 && (
                      <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center">
                        <Zap size={16} className="mr-1 fill-current" />
                        Est. Savings: ${rec.potential_savings}/month
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {rec.status === 'OPEN' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => applyMutation.mutate(rec.id)}
                        disabled={applyMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply Fix"}
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        Dismiss
                      </Button>
                    </>
                  )}
                  {rec.status === 'IMPLEMENTED' && (
                    <div className="flex items-center text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      <CheckCircle2 size={14} className="mr-1.5" />
                      Implemented
                    </div>
                  )}
                  {rec.status === 'DISMISSED' && (
                    <div className="flex items-center text-slate-400 font-semibold text-sm bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      <XCircle size={14} className="mr-1.5" />
                      Dismissed
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardFooter className="bg-slate-50/50 px-6 py-3 border-t border-slate-100">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Related Asset ID: <span className="text-slate-900 font-mono">{rec.inventory_id}</span>
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
