'use client';
import React from 'react';
import { useConnect } from 'wagmi';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div className="relative w-full max-w-xs">
      <Menu as="div" className="relative">
        <Menu.Button
          className="w-full px-5 py-3 bg-gray-900 bg-opacity-40 backdrop-blur-md text-white border border-gray-600 
                                rounded-xl shadow-md flex justify-between items-center font-mono transition-all duration-300
                                hover:border-purple-500 hover:shadow-lg"
        >
          Select Wallet
          <ChevronDownIcon className="w-5 h-5 text-gray-300" />
        </Menu.Button>

        {/* Dropdown Items */}
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Menu.Items className="absolute mt-2 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 z-50">
            {connectors.map((connector) => (
              <Menu.Item key={connector.id}>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-5 py-3 ${
                      active ? 'bg-gray-800 text-purple-400' : 'text-white'
                    } font-mono transition-all duration-200`}
                    onClick={() => connect({ connector })}
                  >
                    {connector.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
