'use client';

import { useState, useEffect } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { WagmiProvider, useAccount } from 'wagmi';
import { config } from './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import VerifyProof from './verify-proof';
import { Account } from './account';
import { WalletOptions } from './wallet-options';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { ad20 } from './abi';

const queryClient = new QueryClient();

function ConnectWallet({ onWalletConnected }) {
  const { address, isConnected } = useAccount();

  // Notify the parent component (Home) when the wallet connects
  useEffect(() => {
    if (isConnected && address) {
      onWalletConnected(address);
    }
  }, [isConnected, address]);

  return isConnected ? <Account /> : <WalletOptions />;
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [proof, setProof] = useState({});
  const [reclaimProofRequest, setReclaimProofRequest] = useState(null);
  const [requestUrl, setRequestUrl] = useState('');
  const [statusUrl, setStatusUrl] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [valid, setValid] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const proofs = [{ id: 1, name: 'Verify Tweet' }];

  // Show error for a few seconds and then hide it
  function showAlert(message) {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000); // ✅ Hide after 3s
  }

  useEffect(() => {
    async function initializeReclaim() {
      const APP_ID = "0xa86Bfa90e723Ba587d18282a5c496Fb6A1537A5a";
      const APP_SECRET = "0x1e0e7dabd93660947e3e00f3c15a49cf22dbce30265bdb5781f39068050a37b4";
      const PROVIDER_ID = "0b978e97-688f-4e9d-b27f-95a012cb46cc";

      const proofRequest = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        PROVIDER_ID
      );
      setReclaimProofRequest(proofRequest);
    }

    initializeReclaim();
  }, []);

  async function generateVerificationRequest() {
    if (!reclaimProofRequest) {
      console.error('Reclaim Proof Request not initialized');
      return;
    }

    if (!walletAddress) {
      showAlert('❌ Wallet not connected.');
      return;
    }

    if (!twitterHandle) {
      showAlert('❌ Twitter handle is required.');
      return;
    }

    // Add user's wallet address and Twitter handle to the context
    // reclaimProofRequest.addContext(`
    //   Wallet: ${walletAddress}`
    // );
    const url = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(url);
    const status = reclaimProofRequest.getStatusUrl();
    setStatusUrl(status);

    await reclaimProofRequest.startSession({
      onSuccess: (proof) => {
        console.log('Verification success', proof);
        setReady(true);
        setProof(proof);

        // Run the retweet verification logic
        const isValid = verifyAnyRetweetFromUser(proof, twitterHandle);

        if (isValid) {
          setVerificationMessage(
            `✅ Verified! The user has retweeted a post from @${twitterHandle}.`
          );
          setValid(true);
        } else {
          setVerificationMessage(
            `❌ No retweets found from @${twitterHandle}.`
          );
          setValid(false);
        }
      },
      onFailure: (error) => {
        console.error('Verification failed', error);
      },
    });
  }

  // Function to verify if the user has retweeted any post from a specific user
  function verifyAnyRetweetFromUser(proof, originalAuthor) {
    if (!proof || !proof.publicData || !proof.publicData.userTweets) {
      console.error('Invalid proof format.');
      return false;
    }

    // Extract user tweets
    const userTweets = proof.publicData.userTweets;

    // Check if any tweet is a retweet from the specified user
    const foundRetweet = userTweets.some((tweet) =>
      tweet.text.startsWith(`RT @${originalAuthor}`)
    );

    if (foundRetweet) {
      console.log(
        `✅ Verified! The user has retweeted at least one post from @${originalAuthor}.`
      );
      return true;
    } else {
      console.error(`❌ No retweets found from @${originalAuthor}.`);
      return false;
    }
  }
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 space-y-6">
          {errorMessage && (
            <div className="absolute top-5 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
              {errorMessage}
            </div>
          )}
          {/* Wallet Connection Box */}
          <div className="absolute top-10 right-20 z-50">
            <div
              className="w-full max-w-xs p-4 rounded-xl shadow-xl 
               bg-gray-900 bg-opacity-40 backdrop-blur-md border border-gray-600 
               before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600 before:to-blue-500 
               before:blur-lg before:-z-10 before:animate-glow"
            >
              <ConnectWallet onWalletConnected={setWalletAddress} />
            </div>
          </div>

          {/* Main Box */}
          <div
            className="relative w-full max-w-lg p-6 rounded-xl shadow-xl overflow-hidden 
                    bg-opacity-30 backdrop-blur-md border border-gray-600
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600 before:to-blue-500
                    before:blur-lg before:-z-10 before:animate-glow"
          >
            <h2 className="text-center text-2xl font-mono text-gray-300 font-bold mb-4">
              📃 AXAL Proofs
            </h2>

            {/* Form Container */}
            <div className="flex flex-col gap-6">
              {/* Dropdown */}
              <div className="relative">
                <label className="block text-sm font-mono text-gray-200">
                  Proof Type
                </label>
                <select
                  className="w-full bg-gray-800 bg-opacity-40 backdrop-blur-lg text-white px-4 py-3 border border-gray-500 rounded-md 
                          focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 hover:border-purple-400"
                  onChange={(e) => setSelectedProof(e.target.value)}
                >
                  <option value="">Select Proof Type</option>
                  <option value="Verify Tweet">Verify Tweet</option>
                </select>
              </div>

              {/* Twitter Handle Input */}
              {selectedProof === 'Verify Tweet' && (
                <>
                  {/* Tweet Content Input */}
                  <div className="relative">
                    <label className="block text-sm font-mono text-gray-200">
                      Username of account to verify for retweet
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Twitter username (e.g., getaxal)"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      className="w-full bg-gray-800 bg-opacity-40 backdrop-blur-lg text-white px-4 py-3 border border-gray-500 
                              rounded-md focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 hover:border-purple-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={generateVerificationRequest}
                    className="w-full bg-gradient-to-b from-black via-gray-800 to-gray-700 text-white font-semibold px-6 py-3 
                        rounded-md shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-mono 
                        border border-gray-600"
                  >
                    Generate QR Code
                  </button>
                </>
              )}
            </div>
            {/* Show QR Code if request is created */}
            {requestUrl && (
              <div className="mt-5 flex flex-col items-center justify-center text-center">
                <h2 className="text-lg text-gray-200 font-mono">
                  📷 Scan this QR Code:
                </h2>
                <div className="mt-3 p-4 bg-white rounded-lg shadow-lg">
                  <QRCode value={requestUrl} className="w-48 h-48" />
                </div>
              </div>
            )}
          </div>
          {/* Show proof verification result */}
          {ready && <VerifyProof proof={proof} />}

          {/* {verified && (
            <div className="mt-4 p-4 bg-green-600 text-white rounded-lg">
              <p>✅ Proof verified & submitted on-chain!</p>
            </div>
          )} */}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
