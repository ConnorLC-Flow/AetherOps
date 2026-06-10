'use client';

import { useState } from 'react';
import { Search, Shield, Zap, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DiscoveryResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MagicScanInput } from '@/components/discovery/MagicScanInput';
import { DiscoveryConsole } from '@/components/discovery/DiscoveryConsole';
import { DiscoveryStagingTable } from '@/components/discovery/DiscoveryStagingTable';

export default function DiscoveryPage() {
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: results = [], isLoading: loadingResults } = useQuery<DiscoveryResult[]>({
    queryKey: ['discovery-results'],
    queryFn: async () => {
      const response = await api.get('/discovery/results/');
      return response.data;
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (domain: string) => {
      setIsScanning(true);
      setScanLogs(['Starting scan for ' + domain + '...']);
      
      // Simulate real-time logs
      const steps = [
        'Querying DNS records...',
        'Scanning subdomains...',
        'Found slack.' + domain + ' - analyzing headers...',
        'Checking Okta/SSO integrations...',
        'Parsing MX records for service signatures...',
        'Matching discovered identifiers against vendor database...',
        'Scan complete. Found 12 candidate services.'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setScanLogs(prev => [...prev, steps[i]]);
      }

      return api.post('/discovery/scan/', { domain });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery-results'] });
      setIsScanning(false);
    },
    onError: () => {
      setIsScanning(false);
      setScanLogs(prev => [...prev, 'Error: Scan failed. Please try again.']);
    }
  });

  const promoteMutation = useMutation({
    mutationFn: async (resultId: string) => {
      return api.post(`/discovery/promote/${resultId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discovery-results'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    scanMutation.mutate(domain);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Domain Discovery</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your company domain to instantly discover all software and SaaS tools in use across your organization.
        </p>
      </div>

      <MagicScanInput 
        domain={domain} 
        setDomain={setDomain} 
        onScan={handleStartScan} 
        isScanning={isScanning} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <DiscoveryConsole logs={scanLogs} isScanning={isScanning} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DiscoveryStagingTable 
            results={results} 
            isLoading={loadingResults} 
            onApprove={(id) => promoteMutation.mutate(id)}
            isPromoting={promoteMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
