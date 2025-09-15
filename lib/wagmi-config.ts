import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Base Shop',
      preference: 'smartWalletOnly',
    }),
    walletConnect({
      projectId,
      showQrModal: true,
    }),
    injected(), // This will catch OKX browser extension
  ],
  transports: {
    [base.id]: http(),
  },
})
