import Web3 from "web3";
import { evenOddAbi } from "./evenOddAbi";
const evenOddContractAddress = "0x4e072b6e8bEa62Bdb1D0f3234B380750aDC3533D";

export const web3 = new Web3(Web3.givenProvider)
export const evenOddContract = new web3.eth.Contract(evenOddAbi as any, evenOddContractAddress);