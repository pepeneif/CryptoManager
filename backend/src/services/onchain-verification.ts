import { PublicClient, createPublicClient, http, Chain } from 'viem';
import { mainnet, polygon, arbitrum, optimism } from 'viem/chains';

// Configuracion de chains
const chains: Record<string, Chain> = {
  ethereum: mainnet,
  polygon,
  arbitrum,
  optimism,
  bsc: { id: 56, name: 'BNB Smart Chain' } as Chain,
};

// RPC endpoints
const RPC_URLS: Record<string, string> = {
  ethereum: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  polygon: process.env.POLY_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
  arbitrum: process.env.ARBI_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/demo',
  optimism: process.env.OPTI_RPC_URL || 'https://opt-mainnet.g.alchemy.com/v2/demo',
  bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
};

// Explorers API
const EXPLORER_APIS: Record<string, { baseUrl: string; apiKey?: string }> = {
  ethereum: { baseUrl: 'https://api.etherscan.io/api', apiKey: process.env.ETHERSCAN_API_KEY },
  polygon: { baseUrl: 'https://api.polygonscan.com/api', apiKey: process.env.POLYGONSCAN_API_KEY },
  arbitrum: { baseUrl: 'https://api.arbiscan.io/api', apiKey: process.env.ARBISCAN_API_KEY },
  optimism: { baseUrl: 'https://api-optimistic.etherscan.io/api', apiKey: process.env.ETHERSCAN_API_KEY },
  bsc: { baseUrl: 'https://api.bscscan.com/api', apiKey: process.env.BSCSCAN_API_KEY },
};

// Clients cache
const clients: Map<string, PublicClient> = new Map();

function getClient(blockchain: string): PublicClient {
  if (!clients.has(blockchain)) {
    const chain = chains[blockchain.toLowerCase()];
    if (!chain) throw new Error('Blockchain no soportada: ' + blockchain);
    
    clients.set(blockchain, createPublicClient({
      chain,
      transport: http(RPC_URLS[blockchain.toLowerCase()]),
    }));
  }
  return clients.get(blockchain)!;
}

export interface WalletInfo {
  id: number;
  address: string;
  blockchain: string;
  tokenAddress?: string;
}

export interface Checkpoint {
  id: number;
  walletId: number;
  balance: string;
  blockNumber: bigint;
  blockTimestamp: Date;
}

export interface Authorization {
  id: number;
  destinationAddress: string;
  amount: string;
  tokenAddress?: string;
  tokenSymbol: string;
  tokenDecimals: number;
  blockchain: string;
  status: string;
}

export interface VerifiedTx {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: Date;
  blockNumber: bigint;
}

export async function getBalance(wallet: WalletInfo): Promise<{ balance: string; balanceUsd?: number }> {
  const client = getClient(wallet.blockchain);
  let balance: bigint;

  if (wallet.tokenAddress) {
    balance = await client.readContract({
      address: wallet.tokenAddress as `0x${string}`,
      abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'address', type: 'address' }], outputs: [{ type: 'uint256' }] }],
      functionName: 'balanceOf',
      args: [wallet.address as `0x${string}`],
    });
  } else {
    balance = await client.getBalance({ address: wallet.address as `0x${string}` });
  }

  return { balance: balance.toString() };
}

export async function createCheckpoint(walletId: number, db: any): Promise<Checkpoint> {
  const wallet = await db('wallets').where({ id: walletId }).first();
  if (!wallet) throw new Error('Wallet ' + walletId + ' no encontrada');

  const balanceResult = await getBalance({ id: wallet.id, address: wallet.address, blockchain: wallet.blockchain });
  const client = getClient(wallet.blockchain);
  const block = await client.getBlock();

  const [checkpointId] = await db('balance_checkpoints').insert({
    wallet_id: walletId,
    balance: balanceResult.balance,
    balance_usd: null,
    block_number: Number(block.number),
    block_hash: block.hash,
    block_timestamp: new Date(Number(block.timestamp) * 1000),
  });

  return { id: checkpointId, walletId, balance: balanceResult.balance, blockNumber: block.number, blockTimestamp: new Date(Number(block.timestamp) * 1000) };
}

export async function getTransactionsSince(wallet: WalletInfo, fromBlock: bigint): Promise<VerifiedTx[]> {
  const explorer = EXPLORER_APIS[wallet.blockchain.toLowerCase()];
  if (!explorer) throw new Error('Explorer no configurado para ' + wallet.blockchain);

  const params = new URLSearchParams({
    module: 'account', action: 'txlist', address: wallet.address,
    startblock: fromBlock.toString(), endblock: '99999999', sort: 'asc',
  });
  
  if (explorer.apiKey) params.append('apiKey', explorer.apiKey);
  const response = await fetch(explorer.baseUrl + '?' + params);
  const data = await response.json();
  if (data.status !== '1') return [];

  return data.result.map((tx: any) => ({
    txHash: tx.hash, from: tx.from, to: tx.to, amount: tx.value,
    timestamp: new Date(tx.timeStamp * 1000), blockNumber: BigInt(tx.blockNumber),
  }));
}

export async function reconcileTransactions(walletId: number, db: any): Promise<{ reconciled: number; pending: VerifiedTx[] }> {
  const lastCheckpoint = await db('balance_checkpoints').where({ wallet_id: walletId }).orderBy('block_number', 'desc').first();
  if (!lastCheckpoint) return { reconciled: 0, pending: [] };

  const wallet = await db('wallets').where({ id: walletId }).first();
  const txs = await getTransactionsSince({ id: wallet.id, address: wallet.address, blockchain: wallet.blockchain }, BigInt(lastCheckpoint.block_number));

  const authorizations = await db('payment_authorizations')
    .where({ destination_address: wallet.address.toLowerCase(), status: 'authorized' })
    .whereRaw('authorized_at > ?', [lastCheckpoint.block_timestamp]);

  let reconciledCount = 0;
  const pending: VerifiedTx[] = [];

  for (const tx of txs) {
    const matchingAuth = authorizations.find((auth: Authorization) => {
      const authAmount = BigInt(auth.amount);
      const txAmount = BigInt(tx.amount);
      const tolerance = authAmount / BigInt(100);
      return tx.to.toLowerCase() === auth.destinationAddress.toLowerCase() &&
             (txAmount >= authAmount - tolerance && txAmount <= authAmount + tolerance);
    });

    if (matchingAuth) {
      await db('verified_transactions').insert({
        tx_hash: tx.txHash, wallet_id: walletId, block_number: Number(tx.blockNumber),
        block_timestamp: tx.timestamp, from_address: tx.from, to_address: tx.to,
        amount: tx.amount, status: 'confirmed', is_reconciled: true,
        reconciled_with_authorization_id: matchingAuth.id, reconciled_at: new Date(),
      });
      
      // Actualizar status de autorizacion
      await db('payment_authorizations').where({ id: matchingAuth.id }).update({ status: 'signed', signed_tx_hash: tx.txHash, signed_at: new Date() });
      reconciledCount++;
    } else {
      pending.push(tx);
    }
  }

  // Marcar checkpoint como reconciliado
  await db('balance_checkpoints').where({ id: lastCheckpoint.id }).update({ is_reconciled: true });

  return { reconciled: reconciledCount, pending };
}