'use client';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  return (
    <div className="flex flex-col items-center p-4 text-center text-white">
      <p className="font-mono text-sm text-gray-300">
        {ensName
          ? `${ensName} (${address})`
          : `${address.slice(0, 6)}...${address.slice(-4)}`}
      </p>
      <button
        onClick={() => disconnect()}
        className="mt-2 px-4 py-2 bg-gray-900 hover:bg-black-700 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:scale-105"
      >
        Disconnect
      </button>
    </div>
  );
}

export function ConnectWallet() {
  const { isConnected } = useAccount();
  return (
    <div className="w-full text-center font-mono text-gray-300">
      {isConnected ? <Account /> : <WalletOptions />}
    </div>
  );
}
