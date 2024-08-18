import axios from "axios";
import * as toml from "toml";
import { ChainInfo } from "../types/chain-info"; 

export async function getChainInfoListService(): Promise<ChainInfo[]> {
  try {
    const url =
      "https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/chainList.toml";
    const detail_url =
      "https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/superchain/configs/";

    const chainInforesponse = await axios.get(url);
    const chainInfoparsedData = toml.parse(chainInforesponse.data);

    const chainInfoList: any = Object.values(chainInfoparsedData).map(
      async (chainToml: any) => {
        const chainsLength: number = chainToml.length;
        let chainInfoResult: ChainInfo[] = [];

        for (let index = 0; index < chainToml.length; index++) {
          const currentChain = chainToml[index];
          const chainInfo = new ChainInfo();

          chainInfo.name = currentChain.name;
          chainInfo.layer = currentChain.parent.type;
          chainInfo.status = currentChain.identifier.startsWith("mainnet")
            ? "Mainnet"
            : "Testnet";
          chainInfo.configuration =
            currentChain.superchain_level == 1 ? "Standard" : "Frontier";
   

          await setChainInfoDetail(
            detail_url + currentChain.identifier + ".toml",
            chainInfo
          );
          chainInfoResult[index] = chainInfo;
        }

        return chainInfoResult;
      }
    );

    return chainInfoList[0];
  } catch (error) {
    console.error("Error fetching or parsing TOML:", error);
    throw new Error("Failed to fetch or parse chain list.");
  }
}

async function setChainInfoDetail(
  url: string,
  chainInfo: ChainInfo
): Promise<ChainInfo> {
  console.log(url);
  const chainDetailresponse = await axios.get(url);
  const chainDetailToml = toml.parse(chainDetailresponse.data);

  chainInfo.upgradeKeys =
    chainDetailToml.addresses.ProxyAdminOwner.toUpperCase() ===
    "0x5a0Aae59D09fccBdDb6C6CcEB07B7279367C3d2A".toUpperCase()
      ? "Security Council"
      : "Internal";
  chainInfo.faultProofs = chainDetailToml.addresses.FaultDisputeGame
    ? "Implemented"
    : "Not implemented";
  chainInfo.decentStage =
    chainInfo.upgradeKeys == "Security Council" &&
    chainInfo.faultProofs == "Implemented"
      ? "Satege 1"
      : "Stage 0";
  chainInfo.charter = "N/A";
  chainInfo.charterLink = "";
  chainInfo.dataAvail = chainDetailToml.data_availability_type.toUpperCase();
  chainInfo.dataAvailLink = "";
  chainInfo.blockTime = "~" + chainDetailToml.block_time;

  return chainInfo;
}
