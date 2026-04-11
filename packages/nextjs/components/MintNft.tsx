"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { pinata } from "~~/utils/config";

export default function MintNft() {
  const { address: connectedAddress } = useAccount();
  const [file, setFile] = useState<File>();
  const [description, setDescription] = useState("");
  const [royaltyPct, setRoyaltyPct] = useState(0);
  const [minting, setMinting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "Ownft" });

  const uploadFile = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    try {
      setMinting(true);

      const urlRequest = await fetch("/api/url"); // Fetches the temporary upload URL
      const urlResponse = await urlRequest.json(); // Parse response
      console.log(urlResponse);
      const upload = await pinata.upload.public.file(file).url(urlResponse.url); // Upload the file with the signed URL
      const fileUrl = await pinata.gateways.public.convert(upload.cid);

      // mint NFT
      await writeContractAsync(
        {
          functionName: "mintNft",
          args: [description, fileUrl, BigInt(royaltyPct * 100)],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("mint successful, txn hash:", txnReceipt.transactionHash);
            toast.success("Mint was successful");

            // clear mint params
            setDescription("");
            setRoyaltyPct(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            setFile(undefined);
            setMinting(false);
          },
        },
      );
    } catch (e) {
      console.error(e);
      setMinting(false);
      toast.error("Something went wrong, try again");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target?.files?.[0];
    setFile(selectedFile);

    if (selectedFile) {
      console.log(selectedFile);
    }
  };

  const validMintParams = () => {
    const validRoyaltyPct = royaltyPct >= 0 && royaltyPct <= 10;
    const validDescription = Boolean(description);
    const validFile = Boolean(file); // todo: add filetype checks
    return validRoyaltyPct && validDescription && validFile;
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-md mx-auto">
      <form>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-content hover:file:bg-primary-focus w-full"
        />
        <input
          type="text"
          value={description}
          placeholder="NFT Description"
          onChange={e => setDescription(e.target.value)}
        />
        <input
          type="number"
          min={0}
          max={10}
          value={royaltyPct}
          placeholder="Secondary Sale Royalty %"
          onChange={e => setRoyaltyPct(Number(e.target.value))}
        />
        <button
          type="button"
          disabled={minting || !connectedAddress || !validMintParams()}
          onClick={uploadFile}
          className="btn btn-primary w-full sm:w-auto"
        >
          {minting ? "Minting..." : !connectedAddress ? "Connect Wallet" : "Mint"}
        </button>
      </form>
    </div>
  );
}
