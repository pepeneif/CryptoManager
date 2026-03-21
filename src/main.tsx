import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Import modules
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
// import { wagmiAdapter } from './wagmi'; // we will create this
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';

// 2. Setup Config
export const config = getDefaultConfig({
  appName: 'CryptoManager',
  projectId: 'YOUR_PROJECT_ID', // Reemplazaremos esto en breve si es necesario por WalletConnect
  chains: [mainnet, polygon, optimism, arbitrum, base, bsc],
  ssr: false, // Client side app
});

// 3. Setup Query Client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
