const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const BlockChain = require("./blockchain");
const { v4: uuidv4 } = require('uuid');
const nodeAddress = uuidv4().split("-").join("");
const port = process.argv[2];
const rp = require("request-promise");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const bitcoin = new BlockChain();


app.get('/blockchain', function (req, res) {
    res.send(bitcoin)
})

app.post('/transaction', function (req, res) {
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ note: `Transaction will be added in block ${blockIndex}` })
})

app.get('/mine', function (req, res) {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;

    const curentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock.index + 1
    }

    const nonce = bitcoin.proofOfWork(previousBlockHash, curentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, curentBlockData, nonce);
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    bitcoin.createNewBlock(12.5, "00", blockHash);

    res.json({
        note: "New block mined successfully̦",
        block: newBlock
    })
})

app.post('/register-and-broadcast-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networksNode.indexOf(newNodeUrl) == -1)
        bitcoin.networksNode.push(newNodeUrl);
    const registerNodesPromises = [];
    bitcoin.networksNode.forEach(networkNodeUrl => {
        const requestOption = {
            url: networkNodeUrl + "/register-node",
            method: "POST",
            body: {
                newNodeUrl
            },
            json: true
        }
        registerNodesPromises.push(rp(requestOption))
    })
    Promise.all(registerNodesPromises).then(data => {
        const bulkRegisterOption = {
            url: newNodeUrl + "/register-nodes-bulk",
            method: "POST",
            body: {
                allNetworksNodes: [...bitcoin.networksNode, bitcoin.currentNodeUrl]
            },
            json: true
        }
        return rp(bulkRegisterOption)
    }).then(data => {
        res.json({ note: "New node registered with network successfully" })
    })
})

app.post('/register-node', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networksNode.indexOf(newNodeUrl) == -1
    console.log("currentNodeUrl", bitcoin.currentNodeUrl)
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    console.log("nodeNotAlreadyPresent", nodeNotAlreadyPresent)
    console.log("notCurrentNode", notCurrentNode)
    if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networksNode.push(newNodeUrl);
    res.json({ note: "New node register successfully with node" })

});

app.post('/register-nodes-bulk', function (req, res) {
    const allNetworksNodes = req.body.allNetworksNodes;
    allNetworksNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.networksNode.indexOf(networkNodeUrl) == -1
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networksNode.push(networkNodeUrl);
    })
    res.json({ note: "Bulk registration successfull" })
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`)
})