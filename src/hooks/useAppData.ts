import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { getDataProvider } from '../data/DataProvider';
import {
  SeedReservation, SeedTask, SeedFeedback,
  SeedFranchiseEnquiry, SeedAuditLog, SeedOutlet
} from '../data/mockSeed';

export function useReservations(currentUser: UserProfile | null) {
  const [data, setData] = useState<SeedReservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getReservations(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchReservations();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('reservations', () => {
      fetchReservations();
    });
    return unsubscribe;
  }, [fetchReservations]);

  return { data, loading, error, refetch: fetchReservations };
}

export function useTasks(currentUser: UserProfile | null) {
  const [data, setData] = useState<SeedTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getSOPsAndTasks(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTasks();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('tasks', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [fetchTasks]);

  return { data, loading, error, refetch: fetchTasks };
}

export function useStaff(currentUser: UserProfile | null) {
  const [data, setData] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getStaffMembers(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff directory');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchStaff();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('users', () => {
      fetchStaff();
    });
    return unsubscribe;
  }, [fetchStaff]);

  return { data, loading, error, refetch: fetchStaff };
}

export function useOutlets(currentUser: UserProfile | null) {
  const [data, setData] = useState<SeedOutlet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOutlets = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getOutlets(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch outlets');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOutlets();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('outlets', () => {
      fetchOutlets();
    });
    return unsubscribe;
  }, [fetchOutlets]);

  return { data, loading, error, refetch: fetchOutlets };
}

export function useFeedback(currentUser: UserProfile | null) {
  const [data, setData] = useState<SeedFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getFeedback(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFeedback();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('feedback', () => {
      fetchFeedback();
    });
    return unsubscribe;
  }, [fetchFeedback]);

  return { data, loading, error, refetch: fetchFeedback };
}

export function useFranchiseEnquiries(currentUser: UserProfile | null) {
  const [data, setData] = useState<SeedFranchiseEnquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getFranchiseEnquiries(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch franchise enquiries');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEnquiries();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('franchise', () => {
      fetchEnquiries();
    });
    return unsubscribe;
  }, [fetchEnquiries]);

  return { data, loading, error, refetch: fetchEnquiries };
}

export function useAuditLogs(currentUser: UserProfile | null) {
  const [data, setData] = useState<SeedAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!currentUser) {
      setData([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getAuditLogs(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLogs();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('auditLogs', () => {
      fetchLogs();
    });
    return unsubscribe;
  }, [fetchLogs]);

  return { data, loading, error, refetch: fetchLogs };
}

export function useLoyaltyBalance(currentUser: UserProfile | null) {
  const [data, setData] = useState<{ rewardPoints: number; tier: string; transactions: any[] }>({
    rewardPoints: 0,
    tier: 'Green',
    transactions: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoyalty = useCallback(async () => {
    if (!currentUser) {
      setData({ rewardPoints: 0, tier: 'Green', transactions: [] });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getDataProvider().getLoyaltyBalance(currentUser);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loyalty balance');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLoyalty();
    const provider = getDataProvider();
    const unsubscribe = provider.subscribe('users', () => {
      fetchLoyalty();
    });
    return unsubscribe;
  }, [fetchLoyalty]);

  return { data, loading, error, refetch: fetchLoyalty };
}
