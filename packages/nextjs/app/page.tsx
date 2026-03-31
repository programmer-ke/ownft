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
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "Ownft",
    functionName: "totalSupply",
  });

  const { data: contract } = useScaffoldContract({contractName: "Ownft"});

  useEffect(() => {
    async function updateAllNfts() {
      setLoadingNFTs(true);
      if (contract && totalSupply) {
	const nftUpdate = [];
	const offset = (page - 1n) * perPage;
	// displaying in descending order of indices
	const remainder = totalSupply - offset;
	const startIndex = remainder - 1n;
	const stopIndex = remainder > perPage ? startIndex - perPage : startIndex - remainder;
	for (let tokenIndex = startIndex; tokenIndex > stopIndex; tokenIndex--) {
	  try {
	    const tokenId = await contract.read.tokenByIndex([tokenIndex]);
	    const tokenURI = await contract.read.tokenURI([tokenId]);
	    const jsonManifestString = atob(tokenURI.substring(29));

	    try {
	      const jsonManifest = JSON.parse(jsonManifestString);
	      nftUpdate.push({ id: tokenId, uri: tokenURI, ...jsonManifest });
	    } catch (e) {
	      console.error(e);
	    }
	  } catch (e) {
	    console.error(e);
	  }
	}
	console.log(nftUpdate);
	setAllNFTs(nftUpdate);
      }
      setLoadingNFTs(false);
    }
    updateAllNfts();
    
  }, [totalSupply, page, Boolean(contract)]);
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
