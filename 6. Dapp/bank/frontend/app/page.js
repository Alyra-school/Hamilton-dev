'use client';

import Bank from "@/components/Bank";
import NotConnected from "@/components/NotConnected";

import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Bank />
      ) : (
        <NotConnected />
      )}
    </>
  );
}
