import Web3 from "web3";
import { evenOddAbi } from "./evenOddAbi";
const evenOddContractAddress = "0x0c25178658500d2Ba37D50b5e702134FA679C365";

export const web3 = new Web3(Web3.givenProvider)
export const evenOddContract = new web3.eth.Contract(evenOddAbi as any, evenOddContractAddress);