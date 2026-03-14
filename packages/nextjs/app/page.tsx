"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { NFTDisplay } from "~~/components/NFTDisplay";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [loadingNFTs, setLoadingNFTs] = useState(true);
  const [allNFTs, setAllNFTs] = useState<any[]>();

  const [page, setPage] = useState(1n);
  const perPage = 12n;
  const totalSupply = 1000n;

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <p className="block text-4xl font-bold"> Your Own NFTs </p>
        <button
          onClick={async () => {
          }}
          className="btn btn-primary"
          disabled={!connectedAddress}
        >
          Mint now
        </button>
      </div>

      <NFTDisplay
        loadingNFTs={loadingNFTs}
        allNFTs={allNFTs}
        page={page}
        setPage={setPage}
        totalTokenCount={totalSupply}
        perPage={perPage}
      />
      
    </>
  );
};

export default Home;
