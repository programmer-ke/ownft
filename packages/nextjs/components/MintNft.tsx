"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { pinata } from "~~/utils/config";

export default function MintNft() {
  const { address: connectedAddress } = useAccount();
  const [file, setFile] = useState<File>();
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [royaltyPct, setRoyaltyPct] = useState(0);
  const [minting, setMinting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "Ownft" });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
            setFileSize(null);
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
      setFileSize(selectedFile.size);
    } else {
      setFileSize(null);
    }
  };

  const validMintParams = () => {
    const validRoyaltyPct = royaltyPct >= 0 && royaltyPct <= 10;
    const validDescription = Boolean(description);
    const validFile = Boolean(file); // todo: add filetype checks
    return validRoyaltyPct && validDescription && validFile;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <form className="flex flex-col gap-4">
        {/* File input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">NFT Image</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="file-input file-input-bordered w-full"
          />
          <label className="label">
            <span className="label-text-alt">
              {fileSize
                ? `Selected file size: ${formatFileSize(fileSize)}`
                : "Select an image file (PNG, JPG, GIF, etc.) *"}
            </span>
          </label>
        </div>

        {/* Description input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <input
            type="text"
            value={description}
            placeholder="Enter a description for your NFT"
            onChange={e => setDescription(e.target.value)}
            className="input input-bordered w-full"
          />
          <label className="label">
            <span className="label-text-alt">This will be stored on-chain</span>
          </label>
        </div>

        {/* Royalty input */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Secondary Sale Royalty (%)</span>
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={royaltyPct}
            placeholder="0-10"
            onChange={e => setRoyaltyPct(Number(e.target.value))}
            className="input input-bordered w-full"
          />
          <label className="label">
            <span className="label-text-alt whitespace-normal break-words">
              Percentage you earn from secondary sales (0-10%) *
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={minting || !connectedAddress || !validMintParams()}
            onClick={uploadFile}
            className="btn btn-primary w-full sm:w-auto"
          >
            {minting ? "Minting..." : !connectedAddress ? "Connect Wallet" : "Mint"}
          </button>
          <div className="text-xs text-base-content/60 text-center sm:text-left space-y-1">
            <p>* A tiny amount of ETH will be used for minting depending on file size</p>
            <p>* Royalty fee support depends on the marketplace</p>
          </div>
        </div>
      </form>
    </div>
  );
}
