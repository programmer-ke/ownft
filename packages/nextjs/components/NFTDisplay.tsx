"use client";

import Image from "next/image";
import { Address } from "@scaffold-ui/components";

type NFT = {
  id: bigint;
  uri: string;
  name: string;
  image: string;
  description: string;
  owner: string;
};

type NFTDisplayProps = {
  loadingNFTs: boolean;
  allNFTs: NFT[] | undefined;
  page: bigint;
  setPage: (page: bigint) => void;
  totalTokenCount: bigint | undefined;
  perPage: bigint;
};

export default function NFTDisplay({
  loadingNFTs: loadingNFTs,
  allNFTs: allNFTs,
  page,
  setPage,
  totalTokenCount,
  perPage,
}: NFTDisplayProps) {
  return (
    <div className="flex-grow bg-base-300 w-full mt-4 p-8 flex justify-center items-center space-x-2">
      {loadingNFTs ? (
        <p className="">Loading...</p>
      ) : !allNFTs?.length ? (
        <p className="font-medium">No NFTs minted</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
            {allNFTs.map(nft => {
              return (
                <div
                  key={nft.id}
                  className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl"
                >
                  <h2 className="">{nft.name}</h2>
                  <Image src={nft.image} alt={nft.name} width={300} height={300} />
                  <p>{nft.description}</p>
                  <Address address={nft.owner} />
                </div>
              );
            })}
          </div>

          {/* page navigation */}
          <div className="flex justify-center mt-8 join">
            {page > 1n && (
              <button className="join-item btn" onClick={() => setPage(page - 1n)}>
                {" "}
                «{" "}
              </button>
            )}
            <button className="join-item btn btn-disabled"> Page {page.toString()} </button>
            {totalTokenCount !== undefined && totalTokenCount > page * perPage && (
              <button className="join-item btn" onClick={() => setPage(page + 1n)}>
                {" "}
                »{" "}
              </button>
            )}
          </div>
          {/* end of page navigation */}
        </div>
      )}
    </div>
  );
}
