"use server";

import { pinata } from "~~/utils/config";

export async function getSignedUploadUrl() {
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 60 * 3,
    });
    return { url };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create signed URL");
  }
}
