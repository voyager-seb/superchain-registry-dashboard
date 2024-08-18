import { getChainInfoListService } from "@/app/services/get-chain-info-service";
import { ChainInfo } from "@/app/types/chain-info";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  //const { address, hypercertID } = await req.json();


  return NextResponse.json(await getChainInfoListService());

  const mockData: ChainInfo[] = [
    {
      name: "Chain A",
      layer: "Layer 1",
      status: "Active",
      configuration: "Config A",
      upgradeKeys: "UpgradeKeyA",
      faultProofs: "FaultProofA",
      decentStage: "Stage 1",
      charter: "Charter A",
      charterLink: "https://example.com/charter-a",
      dataAvail: "Available",
      dataAvailLink: "https://example.com/data-a",
      blockTime: "10s",
    },
    {
      name: "Chain B",
      layer: "Layer 2",
      status: "Inactive",
      configuration: "Config B",
      upgradeKeys: "UpgradeKeyB",
      faultProofs: "FaultProofB",
      decentStage: "Stage 2",
      charter: "Charter B",
      charterLink: "https://example.com/charter-b",
      dataAvail: "Unavailable",
      dataAvailLink: "https://example.com/data-b",
      blockTime: "15s",
    },
  ];

  return NextResponse.json(mockData);
}



