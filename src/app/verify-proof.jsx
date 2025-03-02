import { useState, useEffect } from 'react';
import { writeContract } from '@wagmi/core';
import { abi } from './abi';
import { config } from './config';
import { transformForOnchain } from '@reclaimprotocol/js-sdk';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VerifyProof(props) {
  const [proof, setProof] = useState({});
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const newProof = transformForOnchain(props.proof);
    setProof(newProof);
  }, []);

  return (
    <div>
        <ToastContainer /> 
      <button
        className={`w-full px-6 py-3 font-mono text-white text-lg font-semibold rounded-md transition-all duration-300 
    ${
      verified
        ? 'bg-green-500 hover:bg-green-600 shadow-lg'
        : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-blue-500 hover:to-purple-600 shadow-md hover:shadow-lg'
    }`}
        onClick={async () => {
          try {
            console.log('Submitting proof:', proof);
            setVerified(false); // Reset state before submitting

            const tx = await writeContract(config, {
              abi: abi,
              address: '0x5F7C99F3d6881e4E13e1DFed3292d9c9269C456e',
              functionName: 'verifyProof',
              chainId: 11155111,
              args: [proof],
            });

            if (tx) {
              const explorerLink = `https://sepolia.etherscan.io/tx/${tx}`;

              // ✅ Show Toastify Notification with Clickable Link
              toast.success(
                <div>
                  ✅ Proof Verified!{' '}
                  <a
                    href={explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline font-bold"
                  >
                    View on Explorer
                  </a>
                </div>,
                { position: 'top-right', autoClose: 5000 }
              );

              setVerified(true);
            }
          } catch (error) {
            console.error('❌ Proof verification failed:', error);

            // Show error toast
            toast.error('❌ Proof verification failed. Please try again.', {
              position: 'top-right',
              autoClose: 5000,
            });
          }
        }}
      >
        {verified ? '✅ Proof Verified!' : 'Verify Proof'}
      </button>
    </div>
  );
}
