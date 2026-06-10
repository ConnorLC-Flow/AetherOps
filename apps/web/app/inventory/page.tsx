'use client';

import { Search, Plus, MoreVertical, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SoftwareAsset } from '@/lib/types';
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
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDepartmentFilter] = useState('all');

  const { data: inventory, isLoading, error } = useQuery<SoftwareAsset[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/inventory/');
      return response.data;
    },
  });

  const departments = Array.from(new Set(inventory?.map(a => a.department).filter(Boolean))) as string[];

  const filteredInventory = inventory?.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesDept = deptFilter === 'all' || asset.department === deptFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Software Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A centralized registry of all software, SaaS tools, and internal agents across the organization.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
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
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'all')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
              <SelectItem value="CRM">CRM</SelectItem>
              <SelectItem value="ERP">ERP</SelectItem>
              <SelectItem value="HRIS">HRIS</SelectItem>
              <SelectItem value="COLLAB">Collaboration</SelectItem>
              <SelectItem value="DEV">Development</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deptFilter} onValueChange={(val) => setDepartmentFilter(val || 'all')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="MANAGED">Managed</SelectItem>
              <SelectItem value="DISCOVERED">Discovered</SelectItem>
              <SelectItem value="DEPRECATED">Deprecated</SelectItem>
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
              <TableHead className="w-[250px]">Software Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Monthly Cost</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead>Status</TableHead>
              <th className="px-4 py-2"></th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                    Loading inventory...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {error ? "Unable to connect to backend." : "No assets found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((asset) => (
                <TableRow key={asset.id} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{asset.name}</span>
                        {asset.is_ai_powered && (
                          <span className="bg-indigo-100 text-indigo-700 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">AI</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">ID: {asset.id.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 uppercase tracking-tight">{asset.category}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">{asset.department || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-500">
                      {asset.last_activity_date ? new Date(asset.last_activity_date).toLocaleDateString() : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-slate-900">${asset.monthly_cost?.toLocaleString() || '0'}</div>
                  </TableCell>
                  <TableCell>
                    {asset.contract_status ? (
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase",
                        asset.contract_status === 'ACTIVE' ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-amber-200 text-amber-700 bg-amber-50"
                      )}>
                        {asset.contract_status}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      asset.status === 'MANAGED' ? 'bg-emerald-100 text-emerald-700' :
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
