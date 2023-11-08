import { Psbt } from "bitcoinjs-lib"

import { BrowserWalletSignPSBTResponse, MessageSignatureTypes } from "../types"
import { UnisatSignPSBTOptions } from "./types"
import { isUnisatInstalled } from "./utils"

export async function signPsbt(
  psbt: Psbt,
  { finalize = true, extractTx = true }: UnisatSignPSBTOptions = {}
): Promise<BrowserWalletSignPSBTResponse> {
  if (!isUnisatInstalled()) {
    throw new Error("Unisat not installed.")
  }

  const psbtHex = psbt.toHex()
  const signedPsbtHex = await window.unisat.signPsbt(psbtHex, { autoFinalized: finalize })
  if (!signedPsbtHex) {
    throw new Error("Failed to sign psbt hex using Unisat.")
  }

  if (psbtHex === signedPsbtHex) {
    throw new Error("Psbt has already been signed.")
  }

  const signedPsbt = Psbt.fromHex(signedPsbtHex)

  return {
    hex: extractTx ? signedPsbt.extractTransaction().toHex() : signedPsbt.toHex(),
    base64: !extractTx ? signedPsbt.toBase64() : null
  }
}

export async function signMessage(message: string, type: MessageSignatureTypes = "ecdsa") {
  if (!isUnisatInstalled()) {
    throw new Error("Unisat not installed.")
  }

  const signature = await window.unisat.signMessage(message, type)
  if (!signature) {
    throw new Error("Failed to sign message using Unisat.")
  }

  return {
    base64: signature,
    hex: Buffer.from(signature, "base64").toString("hex")
  }
}
