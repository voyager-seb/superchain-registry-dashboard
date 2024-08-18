import { getChainInfoListService } from "@/app/services/get-chain-info-service";
import { ChainInfo } from "@/app/types/chain-info";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  return NextResponse.json(await getChainInfoListService());

 
}



