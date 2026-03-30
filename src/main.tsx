import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Reown AppKit imports
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { mainnet, polygon, arbitrum, optimism, bsc } from '@reown/appkit/networks'
import { solana, solanaTestnet } from '@reown/appkit/networks'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient();

// Get projectId from WalletConnect Cloud (replace with your project ID)
const projectId = '71ee01dabbdb607ab9b56f87453d53b4'; // Free generic key for dev

const metadata = {
  name: 'CryptoManager',
  description: 'Web3 CFO Dashboard',
  url: 'https://usa.merkle.space',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 1. Setup EVM Adapter (Wagmi)
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, arbitrum, optimism, bsc],
  projectId,
  ssr: false
})

// 2. Setup Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 3. Create the AppKit Modal instance for both Ecosystems
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks: [mainnet, polygon, arbitrum, optimism, bsc, solana, solanaTestnet],
  metadata,
  projectId,
  features: {
    analytics: false,
    email: false,     // Disable email login
    socials: false,   // Disable social login (Google/X)
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': 'var(--bg-primary)',
    '--w3m-color-mix-strength': 10,
    '--w3m-accent': 'var(--primary-color)',
    '--w3m-border-radius-master': '1px'
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);