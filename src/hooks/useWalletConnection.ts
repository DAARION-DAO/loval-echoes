/**
 * Sprint F3 — MetaMask / Wallet Connection Hook
 * 
 * Uses browser-native EIP-1193 API (window.ethereum).
 * No ethers/wagmi/viem dependency.
 * No private keys or signing (EIP-4361 is F3B).
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isMetaMaskInstalled: boolean;
  chainId: string | null;
  error: string | null;
}

export const useWalletConnection = () => {
  const { user } = useAuth();
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    isMetaMaskInstalled: false,
    chainId: null,
    error: null,
  });

  // Check MetaMask availability
  useEffect(() => {
    const checkMetaMask = () => {
      const installed = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
      setState(prev => ({ ...prev, isMetaMaskInstalled: installed }));
    };

    checkMetaMask();

    // MetaMask may inject after page load
    const timeout = setTimeout(checkMetaMask, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState(prev => ({
          ...prev,
          address: null,
          isConnected: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
          error: null,
        }));
        // Save to profile if possible
        if (user) {
          saveWalletToProfile(accounts[0]);
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({ ...prev, chainId }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged as (...args: unknown[]) => void);
        window.ethereum.removeListener('chainChanged', handleChainChanged as (...args: unknown[]) => void);
      }
    };
  }, [user]);

  // Try to save wallet address to profile
  const saveWalletToProfile = async (address: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: address,
          wallet_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        // Column may not exist yet — graceful fallback
        console.warn('[WalletConnection] Could not save wallet to profile (column may not exist):', error.message);
      }
    } catch (err) {
      console.warn('[WalletConnection] Profile update failed:', err);
    }
  };

  // Clear wallet from profile
  const clearWalletFromProfile = async () => {
    if (!user) return;
    try {
      await supabase
        .from('profiles')
        .update({
          wallet_address: null,
          wallet_verified_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } catch (err) {
      console.warn('[WalletConnection] Profile wallet clear failed:', err);
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask not installed. Please install MetaMask to connect your wallet.',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request<string[]>({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request<string>({
        method: 'eth_chainId',
      });

      if (accounts && accounts.length > 0) {
        setState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
          chainId: chainId || null,
          error: null,
        }));

        if (user) {
          await saveWalletToProfile(accounts[0]);
        }
      }
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [user]);

  const disconnectWallet = useCallback(async () => {
    setState(prev => ({
      ...prev,
      address: null,
      isConnected: false,
      chainId: null,
      error: null,
    }));

    await clearWalletFromProfile();
  }, [user]);

  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    truncateAddress,
  };
};
