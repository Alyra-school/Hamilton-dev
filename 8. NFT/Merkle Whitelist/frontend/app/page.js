'use client';
import Header from "@/components/Header";
import Mint from "@/components/Mint";
import { useAccount } from 'wagmi'

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <>
      <Header />
      {isConnected ? (
        <Mint />
      ) : (
        <div>Not connected, please connect your wallet.</div>
      )}
    </>
  );
}
