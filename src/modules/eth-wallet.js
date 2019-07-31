

/*
    AMAN
        life after the middle earth
                        -Highlander

    New paradigms

    Eventing
        all major events emit

        new address creation
        payment received (credit)
        payment sent (debit)

    Auditability Upgrade
            get my address COUNT
            get known addresses COUNT
            get my txs COUNT
            get known txs COUNT
            get TXIDs COUNT
            get Credits COUNT
            get Debits COUNT

    indexed by time
        Redis Scored sets

    Functions
        get address count
        get oldest address
        get addresses start(UNIX) end(UNIX)

        txs/txids ect...


    Bitcoin json-RPC drop in replacement

    clients using npm bitcoin RPC

    custom CLI listens to RPC

 */
const TAG = " | ETH-Wallet | "

const util = require("ethereumjs-util");
const TX = require("ethereumjs-tx");
const rpc = require("./rpc.js")
const rpcCall = rpc.rpcCall
const bigNumber = require('bignumber.js');

const Promise = require("bluebird");
const crypto = require("./crypto");

//let config = require("../config/configMaster").config();
const config = require("../config/env")
const pubsubLib = require("redis")
    , subscriber = pubsubLib.createClient()
    , publisher = pubsubLib.createClient();
const log = require('loggerdog-client')()

let Redis = require('promise-redis')();
let redis = Redis.createClient();

//const contractCreator = require("./contractCreator");
const client = require("./eth-client");
let BASE = 1000000000000000000;

let Web3 = require('web3');
let web3 = new Web3("https://mainnet.infura.io/v3/"+config.INFURA_API);
//web3.setProvider(new Web3.providers.HttpProvider('http://'+config.daemons.ETH.daemon.host+":"+config.daemons.ETH.daemon.port));
//web3.setProvider(new Web3.providers.HttpProvider('http://'+config.ETH_DAEMON.host+":"+config.ETH_DAEMON.port));
//web3.setProvider(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/'+config.INFURA_API))
// let web3ws = new Web3();
// console.log(Web3.providers)
// web3ws.setProvider(new Web3.providers.WebsocketProvider('ws://'+config.daemons.ETH.daemon.host+":8546"));



module.exports = {
    //start
    init: function (mode) {
        return init_wallet(mode)
    },
    getTransaction: function (txid) {
        return redis.hgetall(txid)
    },
    getBlockHeight: function () {
        return web3.eth.getBlockNumber
    },
    getBlockFromHeight: function (height) {
        return web3.eth.getBlock(height).hash
    },
    getHeight: async function (hash) {
        let blockInfo = await web3.eth.getBlock(hash)
        return blockInfo.number
    },
    //import
    getMaster: function () {
        return config.WALLET_MASTER;
    },
    getCoinbase: function () {
        return config.WALLET_MASTER;
    },
    getXpub: function () {
        return config.WALLET_XPUB;
    },
    getNewAddress: function () {
        return  get_new_address()
    },
    getBalance: function () {
        log.debug("balance config: ",config.WALLET_MASTER)
        return client.getBalanceAddress(config.WALLET_MASTER)
    },
    getBalanceAddress: function (address) {
        return client.getBalanceAddress(address)
    },
    getBalanceToken: function (address,token) {
        return client.getBalanceToken(address,token)
    },
    getBalanceTokens: function (address) {
        return client.getBalanceTokens(address)
    },
    getAccounts: function () {
        return redis.smembers("eth:wallet")
    },
    //TODO use rpc to pass in coin
    // sendToAddress: function (address,amount) {
    //     return client.sendToAddress(address,amount)
    // },
    sendToAddress: function (address,amount) {
        return send_to_address(address,amount)
    },
    sendFrom: function (from,to,amount) {
        return send_from_address(from,to,amount)
    },
    sendToken: function (coin,address,amount) {
        return send_token(coin,address,amount)
    },
    getInfo: function () {
        return get_wallet_info()
    },
    // getAccounts: function () {
    //     return send_to_address()
    // },

    //TODO
    //listsinceblock
        // option *notify from block (push notification on all payments from block)
}

const get_new_address = async function () {
    let tag = TAG + " | get_new_address | "
    try {

        let addressNew = await redis.spop(config.ASSET + ":addresses:new")
        log.debug(tag,"address: ",addressNew)
        if(!addressNew) throw Error("102: no addresses available~! ")
        //save issued time
        redis.hset(addressNew,"issued",new Date().getTime())

        //validate

        return addressNew
    } catch (e) {
        log.error(tag, "e: ", e)
    }
}

let send_to_address = async function(address, amount){
    let debug = true
    let tag = TAG + " | send_to_address | "
    try
    {
        let from_address = config.COINBASE_PUB
        let priv = config.COINBASE_PRIV
        log.debug(tag,"priv: ",priv)
        if(!priv) throw Error("100: invalid master config, privKey not found!")
        priv = util.toBuffer(priv)
        let gas_price = await rpcCall("eth_gasPrice", [])
        let to_address = address

        amount = amount * 1000000000000000000
        if(debug) console.log(tag,"amount: ",amount)
        //amount = new util.BN(amount.toString())



        //assert.isNotNull(gas_price,"fail to get gas price")
        //assert.isTrue(util.isValidAddress(to_address),"to address is invalid :"+to_address)
        let nonce = await rpcCall("eth_getTransactionCount",[from_address])
        var rawTx = {
            from:from_address,
            nonce: nonce,
            to: to_address,
            gasPrice: 24000000000,
            value: amount
        };
        // if (data && data.length > 3) {
        //     rawTx.gasLimit = config.GASLIMIT + 60000;
        //     rawTx.data = data
        // }
        // else {
        rawTx.gasLimit = 120000 // this number can be expensive if we increase, user can abuse us to pay fee for their contract execution
        // }
        if (debug) console.log(rawTx)
        var tx = new TX(rawTx);
        tx.sign(priv);
        var serializedTx = tx.serialize();
        if (debug) console.log("tx validate : ",tx.validate())
        //assert.isNotNull(tx.validate(), "tx not validated : "+ tx.validate())
        let result = await rpcCall("eth_sendRawTransaction", [util.bufferToHex(serializedTx)])

        //
        if(result.code === -32010){
            var rawTx = {
                from:from_address,
                nonce: nonce + 1,
                to: to_address,
                gasPrice: 24000000000,
                value: amount
            };
            // if (data && data.length > 3) {
            //     rawTx.gasLimit = config.GASLIMIT + 60000;
            //     rawTx.data = data
            // }
            // else {
            rawTx.gasLimit = 120000 // this number can be expensive if we increase, user can abuse us to pay fee for their contract execution
            // }
            if (debug) console.log(rawTx)
            var tx = new TX(rawTx);
            tx.sign(priv);
            var serializedTx = tx.serialize();
            if (debug) console.log("tx validate : ",tx.validate())
            //assert.isNotNull(tx.validate(), "tx not validated : "+ tx.validate())
            let result2 = await rpcCall("eth_sendRawTransaction", [util.bufferToHex(serializedTx)])
            console.log("sent : ",result2)
            return result2;
        }

        console.log("sent : ",result)
        return result;

    }catch(e){
        console.error(tag,e)
    }

}


var send_token = async function(coin, address, amount){
    let debug = true
    let tag = TAG + " | send_token | "
    try
    {
        let fromAddress = config.WALLET_MASTER

        //get priv
        let index = 0
        let priv = await crypto.generatePrivkey(config.WALLET_XPUB,0,false)
        //priv = util.bufferToHex(priv)
        //priv = util.toBuffer(priv)

        log.debug(tag,"privKey: ",priv)
        log.debug(tag,"fromAddress: ",fromAddress)
        log.debug(tag,"priv: ",priv)

        let nonce = await web3.eth.getTransactionCount(fromAddress,'pending')

        let to_address = address

        let abiInfo = require("../coins/"+coin.toUpperCase()+".abi.js")
        let ABI = abiInfo.ABI
        let metaData = abiInfo.metaData
        let contract = new web3.eth.Contract(ABI,metaData.contractAddress);

        let gas_limit = 240000
        log.debug(tag,"gas_limit: ",gas_limit)

        let transfer_data = contract.methods.transfer(to_address, amount).encodeABI();

        let gas_price = await web3.eth.getGasPrice()
        log.debug(tag,"gas_price: ",gas_price)
        gas_price = parseInt(gas_price)

        //let gas_price = 20000000
        let rawTx = {
            nonce: nonce,
            to: metaData.contractAddress,
            gasPrice: gas_price,
            data: transfer_data,
            gasLimit : gas_limit
        }
        log.debug(tag,"rawTx: ",rawTx)
        let transaction = new TX(rawTx)
        transaction.sign(priv)
        let serializeTx = transaction.serialize()
        let txid = await web3.eth.sendSignedTransaction('0x' + serializeTx.toString('hex')).on('transactionHash', function(txid){
            log.debug("TXID: ",txid)
            return txid
        }).on('receipt', console.log)
        // assert(txid,"fail to send , null txid")
        // console.log("sent:",txid)
        // return txid

    }catch(e){
        console.error(tag,e)
    }

}


// var send_token = async function(coin, address, amount){
//     let debug = true
//     let tag = TAG + " | send_to_address | "
//     try
//     {
//         let fromAddress = config.WALLET_MASTER
//
//         //get priv
//         let index = 0
//         let priv = await crypto.generatePrivkey(config.WALLET_XPUB,0,false)
//         log.debug(tag,"privKey: ",priv)
//         if(debug) console.log(tag,"fromAddress: ",fromAddress)
//         if(debug) console.log(tag,"priv: ",priv)
//
//
//         let to_address = address
//         let gas_limit = 120000
//         if(debug) console.log(tag,"to_address: ",to_address)
//         if(to_address === fromAddress) throw Error("100: invalid tx, can not send to master!")
//
//         let abiInfo = require("../coins/"+coin.toUpperCase()+".abi.js")
//         if(!abiInfo) throw Error("109: unknown asset! ")
//         //console.log(tag,"abiInf)o: ",abiInfo)
//         if(!abiInfo) throw Error("100: unknown token! "+coin)
//
//         //
//         let ABI = abiInfo.ABI
//         let metaData = abiInfo.metaData
//
//         //
//         let contract = new web3.eth.Contract(ABI,metaData.contractAddress);
//         //console.log(tag,"abiInterface: ",abiInterface)
//         //let contract = abiInterface.at(metaData.contractAddress);
//
//         let BASE = metaData.BASE
//         amount = amount * BASE
//         if(debug) console.log(tag,"amount: ",amount)
//
//         let transfer_data = contract.methods.transfer(to_address, amount).encodeABI();
//         if(debug) console.log(tag,"transfer_data: ",transfer_data)
//
//         //let gas_price = await web3.eth.getGasPrice()
//         //log.debug("gas_price: ", gas_price);
//         let gas_price = 20000000000
//
//         //gas_price = parseInt(gas_price,16)
//
//         let nonce = await web3.eth.getTransactionCount(fromAddress)
//
//
//         let gasPriceGwei = 5
//
//         var block = await web3.eth.getBlock("latest");
//         //log.debug("gasLimit: ", block);
//         let gasLimit = block.gasLimit
//
//         let rawTx = {
//             nonce: nonce.toString(16),
//             to: metaData.contractAddress,
//             gasPrice: '0x09184e72a000',
//             gasLimit: '0x30000', //modify accordingly
//             data: transfer_data,
//         }
//         if(debug) console.log(tag,"rawTx: ",rawTx)
//         let transaction = new TX(rawTx)
//         transaction.sign(priv)
//         let serializeTx = transaction.serialize()
//         //let validTx = transaction.validate()
//         //if(!validTx) throw Error("102: failed to validate tx")
//
//
//         log.debug("serializeTx: ",serializeTx)
//         //if broadcast
//         let txid = await web3.eth.sendSignedTransaction('0x' + serializeTx.toString('hex'))
//         console.log("sent:",txid)
//         return txid
//
//     }catch(e){
//         console.error(tag,e)
//     }
//
// }

/*
       Bitcoin getInfo
       {
          "version": 149900,
          "protocolversion": 70015,
          "walletversion": 130000,
          "balance": 1.39135021,
          "blocks": 473382,
          "timeoffset": 0,
          "connections": 8,
          "proxy": "",
          "difficulty": 0.0002441371325370145,
          "testnet": true,
          "keypoololdest": 1519084714,
          "keypoolsize": 100,
          "paytxfee": 0.00000000,
          "relayfee": 0.00100000,
          "errors": "This is a pre-release test build - use at your own risk - do not use for mining or merchant applications"
        }
 */

let get_wallet_info = async function(){
    let tag = TAG+" | unlock_all_accounts | "
    let debug = true
    try{
        let output = {
            version:"aman-0.0.1",
            parity:"",
        }
        //network info stuffs
        //output.isMining = web3.eth.isMining()
        //output.hashrate = web3.eth.getHashrate()
        let gasPrice = await client.getGasPrice()
        output.gasPrice = gasPrice.toString()

        //coinbase
        let coinbase = await client.getCoinbase()
        if(debug) console.log(tag,"coinbase: ",coinbase)
        output.coinbase = coinbase

        //address count
        let accounts = await client.getAccounts()
        if(debug) console.log(tag,"accounts: ",accounts)
        let keypoolsize = accounts.length

        output.keypoolsize = keypoolsize
        output.accounts = accounts

        //detect mainnet/testnet

        //blockheight

        //get known tokens

        //get token balances
        output.balances = await client.getBalanceTokens(coinbase)

        return output
    }catch(e){
        console.error(tag,"error: ",e)
    }
}


let send_from_address = async function(from,to,amount){
    let tag = TAG+" | unlock_all_accounts | "
    let debug = true
    try{

        //unlock from account
        await web3.personal.unlockAccount(from, config.daemons.ETH.unlock)

        //sendFrom
        let txid = await client.sendFrom(from,to,amount)

        return txid
    }catch(e){
        console.error(tag,"error: ",e)
    }
}


const init_wallet = async function(){
    let tag = TAG+ " | init_wallet | "
    let debug = true
    try{
        let masterAddress = config.wallet.master

        //pre
        //is node fully synced?

        //Phase 1 Audit contract deployments

        //if init wallet empty
        let accountsRedis = await redis.smembers("eth:wallet")
        //if(accountsRedis)
        //restore from wallet.dat

        //save config into dir


        //Phase 2 auditability
        //get all token balances from chain

        //get all credits/debits from redis

        //final balance = on chain blanaces
        //else audit crawl

        //UTXO
        //get all accounts
        //get balances on all acounts
        //total avaible
        //max send size
        //sweeping functions to meet max send size

        //list addresses
        let addresses = await client.getAccounts()
        if(debug) console.log(tag,"addresses: ", addresses)

        //add to redis set
        for (var i = 0; i < addresses.length; i++){
            redis.sadd("eth:wallet",addresses[i])
        }

        //base
        //detect payments
        listen_for_blocks()

        if(debug) console.log(tag," wallet operations started!")
        if(debug) console.log(tag," coinbase: ",client.getCoinbase())

    }catch(e){
        console.error(tag,"")
    }
}


let unlock_all_accounts = async function(){
    let tag = TAG+" | unlock_all_accounts | "
    let debug = true
    try{



    }catch(e){
        console.error(tag,"error: ",e)
    }
}



let listen_for_blocks = async function(){
    let tag = TAG+" | listen_for_blocks | "
    let debug = true
    try{
        let filter = web3.eth.filter('latest')

        //
        filter.watch(async function(err,resp){
            //if(debug) console.log(tag,"err: ",err)
            if(debug) console.log(tag,"resp: ",resp)
            redis.sadd("queue:blocks",resp)
            //get block
            // let block = web3.eth.getBlock(resp,true)
            // if(debug) console.log(tag,"block: ",block)

            //save to redis

            //publish to payments

        })


    }catch(e){
        console.error(tag,"error: ",e)
    }
}



//listen for payments
//blocks
//var filter = web3.eth.filter('latest')


let listen_for_payments = async function(){
    let tag = TAG+" | listen_for_payments | "
    let debug = true
    try{
        //let filter = web3.eth.filter({address:'0xfa79424df07f2f22cc159881e05dc85f920daefa'})
        let filter = web3.eth.filter('pending')

        //
        filter.watch(async function(err,resp){
            //if(debug) console.log(tag,"err: ",err)
            //if(debug) console.log(tag,"resp: ",resp)
            //get transaction
            web3.eth.getTransaction(resp, async function(err,resp){
                if(err) throw Error("101: web3 error getTx")

                //console.log(tag,"resp: ",resp)
                if(resp && !resp.to){
                    //console.log("interesting TX: ",resp)
                } else {
                    let isToMe = await redis.sismember("eth:wallet",resp.to)
                    if(isToMe){
                        console.log("***************** winning ******************",resp)
                    }


                    //let isFromMe = redis.sismember("eth:wallet",resp.from)
                }


            })

            //save to redis

            //publish to payments

        })


    }catch(e){
        console.error(tag,"error: ",e)
    }
}

//
// let listen_for_payments = async function(){
//     let tag = TAG+" | listen_for_payments | "
//     let debug = false
//     try{
//         //let filter = web3.eth.filter({address:'0xfa79424df07f2f22cc159881e05dc85f920daefa'})
//
//         // Track all the token transactions in whole blockchain
//         var subscription = web3ws.eth.subscribe('logs', { fromBlock: 1, topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"] }, function() {})
//             .on("data", async function(trxData){
//
//                 if(debug) console.log("trxData: ",trxData)
//
//                 function formatAddress(data) {
//                     var step1 = web3.utils.hexToBytes(data);
//                     for (var i = 0; i < step1.length; i++) if (step1[0] == 0) step1.splice(0, 1);
//                     return web3.utils.bytesToHex(step1);
//                 }
//
//                 if(trxData.data){
//                     let txInfo = {}
//                     let isToMe = false
//                     if(debug) console.log("Register new transfer: " + trxData.transactionHash);
//                     txInfo.txid = trxData.transactionHash
//
//                     let token = trxData.address
//                     txInfo.tokenAddress = token
//                     if(debug) console.log("token: ", token)
//
//                     if(trxData.data){
//                         let txAmount = web3.utils.hexToNumberString(trxData.data)
//                         txInfo.txAmount = txAmount
//                         if(debug) console.log("token: ", token)
//                     }
//
//                     if(trxData.topics['1']){
//                         let fromAddress = formatAddress(trxData.topics['1'])
//                         if(debug) console.log("fromAddress: ", fromAddress)
//                         txInfo.from = fromAddress
//                     }
//
//                     if(trxData.topics['2']){
//                         let toAddress = formatAddress(trxData.topics['2'])
//                         if(debug) console.log("toAddress: ", toAddress)
//                         txInfo.to = toAddress
//
//                         isToMe = await redis.sismember("eth:wallet",txInfo.to)
//                         if(isToMe){
//                             console.log(tag,"************ WINNING ************* txInfo: ",txInfo)
//                         }
//                     }
//
//
//
//                     console.log(tag,"txInfo: ",txInfo)
//
//                     // console.log("Contract " + trxData.address + " has transaction of " + web3.utils.hexToNumberString(trxData.data) + " from " + formatAddress(trxData.topics['1']) + " to " + formatAddress(trxData.topics['2']));
//                     // //console.log(trxData);
//                     // web3.eth.getTransactionReceipt(trxData.transactionHash, function(error, reciept) {
//                     //     console.log(tag,"reciept: ",reciept)
//                     //
//                     //     //console.log('Sent by ' + reciept.from + ' to contract ' + reciept.to);
//                     // });
//                 } else {
//                     //unusual tx (probally not a ERC transfer
//                 }
//
//             });
//
//     }catch(e){
//         console.error(tag,"error: ",e)
//     }
// }
// listen_for_payments()


// filter.watch(co.wrap(function*(err,hash){
//     tag = TAG+" | Block event | "
//     try{
//         var debug = true
//
//         var block = web3.eth.getBlock(hash,true)
//         if(!block) throw "E:102 Unable to get block! hash: "+hash
//         if(block.transactions.length == 0) console.log(clc.green(tag+" Empty Block!"))
//         for (var i = 0; i < block.transactions.length; i++){
//             var tx = block.transactions[i]
//             if(!tx.from) throw "E:103 invalid tx!"
//             if(!tx.to) throw "E:104 invalid tx!"
//             var success = yield redis.sismember("blacklist",tx.from)
//             if(success){
//                 //publish to slack!
//                 console.log(clc.yellow(tag+" Blacklisted address is moving coins! "+tx.from))
//                 console.log(tag," to: ",tx.to)
//                 var success2 = yield redis.sadd("blacklist",tx.to)
//                 if(!success2) throw "E:105 address already in blacklist "+tx.to
//                 if(success2) console.log(clc.cyan(tag+" BLACKLISTED ADDRESS**** : "+tx.to))
//             }
//             if(debug) if(!success) console.log(clc.green(tag+" not blacklisted: "+tx.from))
//         }
//     }catch(e){
//         console.error(tag,"Block event failed to processes block!!! block: " +hash," ERROR: ",e)
//     }
// }))
//



// let get_new_contract_address = async function (userAddress,refundAddress,orderId) {
//     let tag = TAG+ " | get_new_address | "
//     let CHEAT = false
//     let debug = true
//     try{
//         if(!orderId)       throw "ERROR:E101 Attempting getnewaddress without orderId"
//         if(!refundAddress) throw "ERROR:E102 Attempting getnewaddress without refundAddress"
//         if(!userAddress)   throw "ERROR:E103 Attempting getnewaddress without userAddress"
//         try{
//             if(CHEAT) var address = await get_new_address()
//             if(!CHEAT)var address = await contractCreator.createNewAddress(userAddress, refundAddress)
//             if(!address)   throw "ERROR:E104 empty address on contract creation"
//
//             //console.log(tag, "got address from blockchain : " + address)
//             let success = await redis.sadd("eth:address",address)
//             if(!success)   throw "ERROR:E105 unable to add address"
//
//             let event = "contractCreation"
//             let returnAddress = userAddress
//             let depositAddress = address
//             publisher.publish('ethereum', JSON.stringify({event,orderId,returnAddress,depositAddress}))
//             return address
//         }catch(e){
//             console.error(tag," ERROR:",e)
//             throw "unable to make ETH contract deposit address! "
//         }
//     }catch(e){
//         console.error(tag," ERROR: ", e)
//         return false
//     }
// }


let run_wallet = async function(){
    let tag = TAG+ " | get_new_address | "
    let debug = true
    try{
        //list addresses
        let addresses = await client.getAccounts()
        if(debug) console.log(tag,"addresses: ", addresses)

        //add to redis set
        for (var i = 0; i < addresses.length; i++){
            redis.sadd("eth:wallet",addresses[i])
        }

        //


        //watch for payments
        listen_for_payments()


    }catch(e){
        console.error(tag,"err: ",e)
    }
}

// let orderId = "blablabla"
// let userAddress = "0xcdb2c02b43e7b0a88f7692e881b5781fbcd9bbb0"
// let refundAddress = "0x542b4ac70ec66f568caa567256fa1ff8a872d4c1"
//
// get_new_contract_address(userAddress,refundAddress,orderId)
//     .then(function(resp){
//         console.log(resp)
//     })
