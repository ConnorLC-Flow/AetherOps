'use client';

import { Search, Plus, MoreVertical, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AIAsset } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventory, isLoading, error } = useQuery<AIAsset[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory/');
      return response.data;
    },
  });

  const filteredInventory = inventory?.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.provider.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A centralized registry of all AI tools and agents across the organization.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Asset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SAAS">SaaS</SelectItem>
              <SelectItem value="INTERNAL_AGENT">Internal Agent</SelectItem>
              <SelectItem value="CUSTOM_MODEL">Custom Model</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DEPRECATED">Deprecated</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load inventory from the server. Showing offline state.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">Asset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <th className="px-4 py-2"></th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                    Loading inventory...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {error ? "Unable to connect to backend." : "No assets found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((asset) => (
                <TableRow key={asset.id} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{asset.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">ID: {asset.id.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 uppercase tracking-tight">{asset.type.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{asset.provider}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {asset.owner_email}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      asset.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      asset.status === 'DEPRECATED' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    )}>
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
