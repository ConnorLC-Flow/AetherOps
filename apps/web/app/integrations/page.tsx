'use client';

import { useState } from 'react';
import { 
  Zap, 
  RefreshCcw, 
  Link2, 
  Link2Off, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Connector, Vendor } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function IntegrationsPage() {
  const queryClient = useQueryClient();

  const { data: connectors = [], isLoading: loadingConnectors } = useQuery<Connector[]>({
    queryKey: ['connectors'],
    queryFn: async () => {
      const response = await api.get('/connectors/');
      return response.data;
    },
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/vendors/');
      return response.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (connectorId: string) => {
      return api.post(`/connectors/${connectorId}/sync/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (connectorId: string) => {
      return api.delete(`/connectors/${connectorId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Integration Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your SaaS ecosystem to pull real-time usage, seat counts, and spend data directly from provider APIs.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-600 font-semibold uppercase text-[10px] tracking-wider">Active Links</CardDescription>
            <CardTitle className="text-2xl text-emerald-900">{connectors.filter(c => c.sync_status === 'ACTIVE').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-600 font-semibold uppercase text-[10px] tracking-wider">Pending Sync</CardDescription>
            <CardTitle className="text-2xl text-amber-900">{connectors.filter(c => c.sync_status === 'PENDING').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-rose-50/50 border-rose-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-rose-600 font-semibold uppercase text-[10px] tracking-wider">Failed Connections</CardDescription>
            <CardTitle className="text-2xl text-rose-900">{connectors.filter(c => c.sync_status === 'FAILED').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Managed Connectors</CardTitle>
          <CardDescription>Authentication status and sync history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Last Successful Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingConnectors ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : connectors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No active integrations. Click "Add Integration" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  connectors.map((connector) => (
                    <TableRow key={connector.id}>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                            <Zap size={16} className="text-indigo-600" />
                          </div>
                          {connector.vendor_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {connector.auth_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {connector.sync_status === 'ACTIVE' ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : connector.sync_status === 'FAILED' ? (
                            <AlertCircle size={16} className="text-rose-500" />
                          ) : (
                            <Clock size={16} className="text-amber-500" />
                          )}
                          <span className={cn(
                            "text-xs font-medium",
                            connector.sync_status === 'ACTIVE' ? "text-emerald-700" :
                            connector.sync_status === 'FAILED' ? "text-rose-700" : "text-amber-700"
                          )}>
                            {connector.sync_status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(connector.last_sync_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => syncMutation.mutate(connector.id)}
                            disabled={syncMutation.isPending}
                          >
                            <RefreshCcw size={14} className={cn("mr-1", syncMutation.isPending && "animate-spin")} />
                            Sync Now
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => {
                              if (confirm('Are you sure you want to disconnect this integration?')) {
                                deleteMutation.mutate(connector.id);
                              }
                            }}
                          >
                            <Link2Off size={14} className="mr-1" />
                            Disconnect
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-bold mb-4">Recommended Connections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Slack', 'GitHub', 'Google Workspace', 'AWS', 'Zoom', 'Okta', 'Notion', 'Stripe'].map(service => (
            <Card key={service} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                    <ExternalLink size={18} className="text-slate-400 group-hover:text-indigo-500" />
                  </div>
                  <span className="font-semibold text-sm">{service}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Link2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
