/**
 * Sprint F3 — MetaMask Wallet Connect Component
 * 
 * Connect/disconnect MetaMask via EIP-1193.
 * Shows connected address, chain, copy button.
 * No web3 library dependency.
 */

import { useState } from 'react';
import { 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  Unplug,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useTranslation } from '@/lib/i18n';

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum Mainnet',
  '0x5': 'Goerli Testnet',
  '0xaa36a7': 'Sepolia Testnet',
  '0x89': 'Polygon',
  '0xa4b1': 'Arbitrum One',
  '0xa': 'Optimism',
};

export const WalletConnect = () => {
  const { t } = useTranslation();
  const {
    address,
    isConnected,
    isConnecting,
    isMetaMaskInstalled,
    chainId,
    error,
    connectWallet,
    disconnectWallet,
    truncateAddress,
  } = useWalletConnection();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chainName = chainId ? (CHAIN_NAMES[chainId] || `Chain ${parseInt(chainId, 16)}`) : null;

  return (
    <Card className="border-slate-800/60 bg-slate-900/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-indigo-400" />
          {t.identity.walletTitle}
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          {t.identity.walletDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isConnected && address ? (
          <>
            {/* Connected state */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    {t.identity.walletAddress}
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase font-bold">
                    {t.identity.walletVerified}
                  </Badge>
                </div>
                <div className="font-mono text-sm text-slate-100">
                  {truncateAddress(address)}
                </div>
                {chainName && (
                  <div className="text-[10px] text-slate-500">
                    {t.identity.chainLabel}: {chainName}
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-200"
                  onClick={handleCopy}
                  title={t.identity.copyAddress}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-400"
                  onClick={disconnectWallet}
                  title={t.identity.disconnectWallet}
                >
                  <Unplug className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        ) : isMetaMaskInstalled ? (
          <>
            {/* MetaMask available — show connect button */}
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.identity.connecting}
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  {t.identity.connectMetaMask}
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            {/* MetaMask not installed */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs font-medium text-amber-300">
                  {t.identity.installMetaMask}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {t.identity.installMetaMaskDesc}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-amber-500/20 text-amber-300 hover:bg-amber-500/10"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1.5" />
                metamask.io
              </Button>
            </div>
          </>
        )}

        {/* Error display */}
        {error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-2">
            <p className="text-[10px] text-red-400">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
