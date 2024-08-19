import axios from "axios";
import * as toml from "toml";
import { ChainInfo } from "../types/chain-info";

const url =
  "https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/chainList.toml";
const detail_url =
  "https://raw.githubusercontent.com/ethereum-optimism/superchain-registry/main/superchain/configs/";

const toml_extension = ".toml";

export async function getChainInfoListService(): Promise<ChainInfo[]> {
  try {
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
          chainInfo.status = getStatus(currentChain.identifier);
          chainInfo.configuration = getConfiguration(
            currentChain.superchain_level
          );

          await setChainInfoDetail(
            detail_url + currentChain.identifier + toml_extension,
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

  chainInfo.upgradeKeys = getUpgradeKeys(chainDetailToml.addresses);
  chainInfo.faultProofs = getFaultProofs(chainDetailToml.addresses);
  chainInfo.decentStage = getDecentStage(chainInfo);
  chainInfo.charter = "N/A";
  chainInfo.charterLink = "";
  chainInfo.dataAvail = chainDetailToml.data_availability_type.toUpperCase();
  chainInfo.dataAvailLink = "";
  chainInfo.blockTime = "~" + chainDetailToml.block_time;

  return chainInfo;
}

function getDecentStage(chainInfo: ChainInfo) {
  return chainInfo.upgradeKeys == "Security Council" &&
    chainInfo.faultProofs == "Implemented"
    ? "Stage 1"
    : "Stage 0";
}

function getFaultProofs(addresses: any) {
  return addresses.FaultDisputeGame ? "Implemented" : "Not implemented";
}
function getUpgradeKeys(addresses: any) {
  return addresses.ProxyAdminOwner.toUpperCase() ===
    "0x5a0Aae59D09fccBdDb6C6CcEB07B7279367C3d2A".toUpperCase()
    ? "Security Council"
    : "Unspecified";
}

function getStatus(identifier: string) {
  return identifier.startsWith("mainnet") ? "Mainnet" : "Testnet";
}

function getConfiguration(superchain_level: number) {
  return superchain_level == 1 ? "Standard" : "Frontier";
}
