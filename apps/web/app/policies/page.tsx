'use client';

import { Plus, Shield, ShieldAlert, ShieldCheck, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Policy } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';

const mockPolicies: Policy[] = [
  { id: '1', name: 'No PII in Prompts', description: 'Blocks any transmission of Credit Card numbers or SSNs to external AI APIs.', severity: 'CRITICAL', is_enabled: true, created_at: '2024-01-10' },
  { id: '2', name: 'Model Restriction', description: 'Only approved models (GPT-4, Claude-3) can be used for production applications.', severity: 'WARNING', is_enabled: true, created_at: '2024-02-15' },
  { id: '3', name: 'Usage Quota Alert', description: 'Notify admins when a team reaches 80% of their monthly AI budget.', severity: 'INFO', is_enabled: true, created_at: '2024-03-01' },
  { id: '4', name: 'Off-hours Restriction', description: 'Internal agents should not perform high-cost batch tasks between 9 AM - 5 PM.', severity: 'INFO', is_enabled: false, created_at: '2024-03-20' },
];

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: policies = mockPolicies, isLoading } = useQuery<Policy[]>({
    queryKey: ['policies'],
    queryFn: async () => {
      try {
        const response = await api.get('/policies/');
        return response.data;
      } catch (err) {
        console.error("Failed to fetch policies, using mock data", err);
        return mockPolicies;
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      return api.put(`/policies/${id}`, { is_enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-foreground">Policy Engine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define and enforce governance rules across your AI infrastructure.
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Define a new governance rule for your AI assets.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" placeholder="Policy name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" placeholder="Short description" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsCreateModalOpen(false)}>Save Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : policies.map((policy) => (
          <div key={policy.id} className={cn(
            "bg-white rounded-lg shadow-sm border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-200",
            !policy.is_enabled && "opacity-60 grayscale-[0.5]"
          )}>
            <div className="flex items-start space-x-4">
              <div className={cn(
                "p-2.5 rounded-xl",
                policy.severity === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                policy.severity === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
              )}>
                {policy.severity === 'CRITICAL' ? <ShieldAlert size={24} /> :
                 policy.severity === 'WARNING' ? <Shield size={24} /> :
                 <ShieldCheck size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{policy.name}</h3>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    policy.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    policy.severity === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  )}>
                    {policy.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">{policy.description}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-2">Created: {policy.created_at}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 mr-2">
                <Switch 
                  id={`policy-${policy.id}`} 
                  checked={policy.is_enabled} 
                  onCheckedChange={(checked) => toggleMutation.mutate({ id: policy.id, is_enabled: checked })}
                />
                <Label htmlFor={`policy-${policy.id}`} className="text-xs font-medium cursor-pointer">
                  {policy.is_enabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
