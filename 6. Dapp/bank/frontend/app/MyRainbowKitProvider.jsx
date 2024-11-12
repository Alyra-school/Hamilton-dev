'use client';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { http } from 'wagmi';

const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: '66836973d0e7ca63cb5f21c0f0fc984b',
    chains: [sepolia],
    ssr: true, // If your dApp uses server side rendering (SSR)
    transports: {
      [sepolia.id]: http(process.env.RPC),
    },
});

const queryClient = new QueryClient();

const MyRainbowKitProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
                {children}
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  )
}

export default MyRainbowKitProvider