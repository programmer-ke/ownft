"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import MintNft from "~~/components/MintNft";
import NFTDisplay from "~~/components/NFTDisplay";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [loadingNFTs, setLoadingNFTs] = useState(true);
  const [allNFTs, setAllNFTs] = useState<any[]>();

  const [page, setPage] = useState(1n);
  const perPage = 12n;
  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "Ownft",
    functionName: "totalSupply",
  });

  const { data: contract } = useScaffoldContract({ contractName: "Ownft" });

  const updateNFTDescription = (tokenId: bigint, newDescription: string) => {
    setAllNFTs(prevNFTs => {
      if (!prevNFTs) return prevNFTs;
      return prevNFTs.map(nft => (nft.id === tokenId ? { ...nft, description: newDescription } : nft));
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function updateAllNfts() {
      if (!contract || !totalSupply) return;
      setLoadingNFTs(true);
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

      if (!cancelled) {
        setAllNFTs(nftUpdate);
        setLoadingNFTs(false);
      }
    }

    updateAllNfts();

    return () => {
      cancelled = true;
    };
  }, [totalSupply, page, contract?.address]);
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <p className="block text-4xl font-bold"> Your Own NFTs </p>
        <MintNft />
      </div>

      <NFTDisplay
        loadingNFTs={loadingNFTs}
        allNFTs={allNFTs}
        page={page}
        setPage={setPage}
        updateNFTDescription={updateNFTDescription}
        totalTokenCount={totalSupply}
        perPage={perPage}
      />
    </>
  );
};

export default Home;
