/**
 * EIP-1193 Ethereum Provider type declarations.
 * Used for MetaMask and compatible wallet extensions.
 * No external web3 library dependency.
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  isConnected(): boolean;
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on(event: 'chainChanged', handler: (chainId: string) => void): void;
  on(event: 'disconnect', handler: (error: { code: number; message: string }) => void): void;
  on(event: 'connect', handler: (info: { chainId: string }) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}
