import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Alert } from '@/lib/types';

export function useAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading, error } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        const response = await api.get('/alerts/');
        return response.data;
      } catch (err: any) {
        // If 404, the endpoint might not be ready yet
        if (err.response?.status === 404) {
          console.warn("Alerts endpoint not found, returning empty list");
          return [];
        }
        throw err;
      }
    },
    refetchInterval: 30000, // 30 seconds
  });

  const dismissMutation = useMutation({
    mutationFn: async (alertId: string) => {
      // Try to call backend dismiss
      try {
        return await api.post(`/alerts/${alertId}/dismiss/`);
      } catch (err: any) {
        // If 404, the endpoint might not be ready yet
        if (err.response?.status === 404) {
          console.warn("Dismiss endpoint not found, handling locally");
          return { success: true, local: true };
        }
        throw err;
      }
    },
    onMutate: async (alertId: string) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ['alerts'] });
      const previousAlerts = queryClient.getQueryData<Alert[]>(['alerts']);
      if (previousAlerts) {
        queryClient.setQueryData<Alert[]>(['alerts'], 
          previousAlerts.filter(a => a.id !== alertId)
        );
      }
      return { previousAlerts };
    },
    onError: (err, alertId, context: any) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(['alerts'], context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const unreadCount = alerts.filter(a => a.status === 'UNREAD' || !a.status).length;

  return {
    alerts,
    isLoading,
    error,
    unreadCount,
    dismiss: dismissMutation.mutate,
  };
}
