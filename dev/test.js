const BlockChain = require("./blockchain");

const bitcoin = new BlockChain();
console.log(bitcoin)
const previousBlockHash = 'FHFHFHFHFHFHFBJGVUIREGIVGIUVGUREGVBYUIVE';
const currentBlockData = [
    {
        amount: 101,
        sender: "JREKGKEGKGFEGFUIWBVCKIYUGCEYV",
        recipient: "RGEUFGEUGFIUGUIEGVBREVUGRUE"
    },
    {
        amount: 30,
        sender: "VGGUIUGVUIBRHEYVBHEVVYGRVGYURUGVUI",
        recipient: "VUEGUIVEUIGVUEGUGUEGVYEGVYEUYVG"
    },
    {
        amount: 200,
        sender: "VDJGUIDGVUGDUGVUIDFGVIUGUI",
        recipient: "VGIUVGUGVIUVYDGFGKDIDFIG"
    },
]

const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce));