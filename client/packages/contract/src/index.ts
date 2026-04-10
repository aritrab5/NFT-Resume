import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CA3EKKD7D2C4LG7QSMG3MFBFFHPR7UVDJQT7N6AMJDZQEJNGT2SJ3MY7",
  }
} as const


export interface Resume {
  experience: string;
  name: string;
  portfolio: string;
  skills: string;
}

export type DataKey = {tag: "Resume", values: readonly [u64]} | {tag: "Owner", values: readonly [u64]} | {tag: "Counter", values: void};

export interface Client {
  /**
   * Construct and simulate a mint transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mint: ({user, resume}: {user: string, resume: Resume}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a owner_of transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner_of: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer: ({from, to, id}: {from: string, to: string, id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_resume transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_resume: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Resume>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABlJlc3VtZQAAAAAABAAAAAAAAAAKZXhwZXJpZW5jZQAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACXBvcnRmb2xpbwAAAAAAABAAAAAAAAAABnNraWxscwAAAAAAEA==",
        "AAAAAAAAAAAAAAAEbWludAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAAZyZXN1bWUAAAAAB9AAAAAGUmVzdW1lAAAAAAABAAAABg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABlJlc3VtZQAAAAAAAQAAAAYAAAABAAAAAAAAAAVPd25lcgAAAAAAAAEAAAAGAAAAAAAAAAAAAAAHQ291bnRlcgA=",
        "AAAAAAAAAAAAAAAIb3duZXJfb2YAAAABAAAAAAAAAAJpZAAAAAAABgAAAAEAAAPoAAAAEw==",
        "AAAAAAAAAAAAAAAIdHJhbnNmZXIAAAADAAAAAAAAAARmcm9tAAAAEwAAAAAAAAACdG8AAAAAABMAAAAAAAAAAmlkAAAAAAAGAAAAAA==",
        "AAAAAAAAAAAAAAAKZ2V0X3Jlc3VtZQAAAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAD6AAAB9AAAAAGUmVzdW1lAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    mint: this.txFromJSON<u64>,
        owner_of: this.txFromJSON<Option<string>>,
        transfer: this.txFromJSON<null>,
        get_resume: this.txFromJSON<Option<Resume>>
  }
}