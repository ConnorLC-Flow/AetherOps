'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Filter,
  RefreshCcw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/api';
import { GatewayLog } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function GatewayLogsPage() {
  const [searchTerm, setSearchState] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'ALLOWED' | 'BLOCKED'>('ALL');

  const { data: logs = [], isLoading, error, refetch } = useQuery<GatewayLog[]>({
    queryKey: ['gateway-logs'],
    queryFn: async () => {
      try {
        const response = await api.get('/gateway/logs/');
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.warn("Gateway logs endpoint not found, using mock data");
          return [
            {
              id: '1',
              timestamp: '2026-05-08T10:15:00Z',
              tool_name: 'OpenAI GPT-4',
              request_summary: 'Analyze customer data for churn prediction',
              decision: 'ALLOWED',
              reason: 'Compliant with data privacy policy'
            },
            {
              id: '2',
              timestamp: '2026-05-08T09:42:11Z',
              tool_name: 'Anthropic Claude 3.5',
              request_summary: 'Generate marketing email for project X',
              decision: 'BLOCKED',
              reason: 'PII detected: Social Security Number found in prompt'
            },
            {
              id: '3',
              timestamp: '2026-05-08T08:30:00Z',
              tool_name: 'Custom Model (Financial)',
              request_summary: 'Quarterly revenue forecast',
              decision: 'ALLOWED',
              reason: 'Pre-approved model for internal financial data'
            },
            {
              id: '4',
              timestamp: '2026-05-07T22:10:05Z',
              tool_name: 'Jasper AI',
              request_summary: 'Blog post generation about AI governance',
              decision: 'BLOCKED',
              reason: 'Shadow AI: Tool not authorized for corporate use'
            }
          ] as GatewayLog[];
        }
        throw err;
      }
    }
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.request_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDecision = decisionFilter === 'ALL' || log.decision === decisionFilter;
    
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Agent Gateway Logs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Audit trail of all AI requests and governance decisions.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-fit"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCcw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          Refresh Logs
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by tool, request, or reason..."
                className="pl-9 bg-slate-50/50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchState(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 mr-1" />
              <div className="flex bg-slate-100 p-1 rounded-md">
                {(['ALL', 'ALLOWED', 'BLOCKED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDecisionFilter(filter)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                      decisionFilter === filter 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {filter.charAt(0) + filter.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[180px]">Tool Name</TableHead>
                  <TableHead>Request Summary</TableHead>
                  <TableHead className="w-[120px]">Decision</TableHead>
                  <TableHead className="max-w-[250px]">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Clock className="h-5 w-5 animate-pulse" />
                        Loading logs...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                      No logs found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-600">
                        <div className="flex flex-col">
                          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{log.tool_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 italic max-w-[300px] truncate">
                        {(() => {
                          try {
                            const parsed = JSON.parse(log.request_summary);
                            return parsed.prompt || log.request_summary;
                          } catch (e) {
                            return log.request_summary;
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={log.decision === 'ALLOWED' ? 'outline' : 'destructive'}
                          className={cn(
                            "flex items-center gap-1 w-fit",
                            log.decision === 'ALLOWED' 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          )}
                        >
                          {log.decision === 'ALLOWED' ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {log.decision}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 max-w-[250px]">
                        {log.reason}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-50 border-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{logs.length}</div>
            <p className="text-xs text-indigo-600/70 mt-1 italic">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Allowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {logs.filter(l => l.decision === 'ALLOWED').length}
            </div>
            <p className="text-xs text-emerald-600/70 mt-1 italic">
              {logs.length > 0 ? ((logs.filter(l => l.decision === 'ALLOWED').length / logs.length) * 100).toFixed(1) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600 uppercase tracking-wider">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">
              {logs.filter(l => l.decision === 'BLOCKED').length}
            </div>
            <p className="text-xs text-rose-600/70 mt-1 italic">Governance interventions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
