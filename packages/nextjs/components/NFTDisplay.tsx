"use client";

import { useState } from "react";
import Image from "next/image";
import { Address } from "@scaffold-ui/components";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { CheckIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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
  updateNFTDescription: (tokenId: bigint, newDescription: string) => void;
  totalTokenCount: bigint | undefined;
  perPage: bigint;
};

export default function NFTDisplay({
  loadingNFTs: loadingNFTs,
  allNFTs: allNFTs,
  page,
  setPage,
  updateNFTDescription,
  totalTokenCount,
  perPage,
}: NFTDisplayProps) {
  const { address: currentUser } = useAccount();
  const [editingNftId, setEditingNftId] = useState<bigint | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "Ownft" });
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (nftId: bigint, currentDescription: string) => {
    setEditingNftId(nftId);
    setNewDescription(currentDescription);
  };

  const handleSave = async (nftId: bigint) => {
    try {
      setIsSaving(true);
      await writeContractAsync(
        {
          functionName: "updateTokenDescription",
          args: [nftId, newDescription],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("mint successful, txn hash:", txnReceipt.transactionHash);
            setEditingNftId(null);
            setIsSaving(false);
            updateNFTDescription(nftId, newDescription);
          },
        },
      );
    } catch (e) {
      console.error(e);
      setIsSaving(false);
      toast.error("Something went wrong, try again");
    }
  };

  const handleCancel = () => {
    setEditingNftId(null);
  };

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
              const isOwner = currentUser && nft.owner.toLowerCase() === currentUser.toLowerCase();

              const isEditing = editingNftId === nft.id;

              return (
                <div
                  key={nft.id}
                  className="flex flex-col bg-base-100 p-5 text-center items-center max-w-xs rounded-3xl"
                >
                  <h2 className="">{nft.name}</h2>
                  <Image src={nft.image} alt={nft.name} width={300} height={300} />
                  <div className="flex items-center gap-2 mt-2">
                    {isEditing ? (
                      <div className="flex flex-col w-full">
                        <input
                          type="text"
                          value={newDescription}
                          onChange={e => setNewDescription(e.target.value)}
                          className="input input-bordered w-full"
                        />
                        <div className="flex justify-center gap-2 mt-2">
                          <button
                            disabled={isSaving}
                            onClick={() => handleSave(nft.id)}
                            className="btn btn-success btn-sm disabled:opacity-50"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button onClick={handleCancel} className="btn btn-error btn-sm">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p>{nft.description}</p>
                        {isOwner && (
                          <PencilIcon
                            className="h-5 w-5 cursor-pointer text-gray-300 hover:text-gray-700"
                            onClick={() => handleEdit(nft.id, nft.description)}
                            title="Edit NFT"
                          />
                        )}
                      </>
                    )}
                  </div>
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
