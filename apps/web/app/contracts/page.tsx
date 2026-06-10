'use client';

import { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Filter, 
  ArrowRight,
  TrendingDown,
  User,
  Mail,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Contract } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ContractKPIs } from '@/components/contracts/ContractKPIs';
import { RenewalAlertPanel } from '@/components/contracts/RenewalAlertPanel';
import { ContractTable } from '@/components/contracts/ContractTable';
import { RenewalTimeline } from '@/components/contracts/RenewalTimeline';

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'table' | 'timeline'>('table');

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await api.get('/contracts/');
      return response.data;
    },
  });

  const upcomingRenewals = contracts.filter(c => {
    const renewalDate = new Date(c.renewal_date);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30; // Changed to 30 as per spec
  });

  const dangerZone = contracts.filter(c => {
    const renewalDate = new Date(c.renewal_date);
    const today = new Date();
    // Notice deadline is renewal_date - notice_period_days
    const noticeDeadline = new Date(renewalDate.getTime() - (c.notice_period_days * 24 * 60 * 60 * 1000));
    const diffTime = noticeDeadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // In danger zone if notice deadline is within 14 days or already passed
    return diffDays <= 14;
  });

  const totalSpend = contracts.reduce((acc, curr) => acc + (curr.total_contract_value || 0), 0);
  const totalVendors = new Set(contracts.map(c => c.vendor_id)).size;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Contract Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your software lifecycle, manage renewal dates, and eliminate surprise auto-renewals.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button 
              variant={view === 'table' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8 text-xs px-4", view === 'table' && "bg-white shadow-sm")}
              onClick={() => setView('table')}
            >
              Table
            </Button>
            <Button 
              variant={view === 'timeline' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8 text-xs px-4", view === 'timeline' && "bg-white shadow-sm")}
              onClick={() => setView('timeline')}
            >
              Timeline
            </Button>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </div>
      </div>

      <ContractKPIs 
        totalSpend={totalSpend} 
        upcomingRenewalsCount={upcomingRenewals.length} 
        totalVendors={totalVendors || contracts.length} 
      />

      <RenewalAlertPanel dangerZoneContracts={dangerZone} />

      {view === 'table' ? (
        <ContractTable 
          contracts={contracts} 
          isLoading={isLoading} 
          upcomingRenewals={upcomingRenewals} 
        />
      ) : (
        <RenewalTimeline contracts={contracts} />
      )}
    </div>
  );
}
