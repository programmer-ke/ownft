"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { pinata } from "~~/utils/config";

export default function MintNft() {
  const { address: connectedAddress } = useAccount();
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }

    try {
      setUploading(true);
      const urlRequest = await fetch("/api/url"); // Fetches the temporary upload URL
      const urlResponse = await urlRequest.json(); // Parse response
      console.log(urlResponse);
      const upload = await pinata.upload.public.file(file).url(urlResponse.url); // Upload the file with the signed URL
      const fileUrl = await pinata.gateways.public.convert(upload.cid);
      setUrl(fileUrl);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-md mx-auto">
      <input
        type="file"
        onChange={handleChange}
        disabled={!connectedAddress}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-content hover:file:bg-primary-focus w-full"
      />
      <button
        type="button"
        disabled={uploading || !connectedAddress}
        onClick={uploadFile}
        className="btn btn-primary w-full sm:w-auto"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {url && <img src={url} alt="Image from Pinata" className="mt-4 max-w-full max-h-64 h-auto rounded-lg" />}
    </div>
  );
}
