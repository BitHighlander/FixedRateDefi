const bip39 = require('bip39');
const HDKey = require('hdkey');
const CoinKey = require('coinkey');
const coininfo = require('coininfo');

// import HDKey from 'hdkey'
// import CoinKey from 'coinkey'
// import ethUtils from 'ethereumjs-util'
// import bitcoinMessage from 'bitcoinjs-message'
// import bitcoin from 'bitcoinjs-lib'
// import { API_HOST } from '../config'
// import coininfo from 'coininfo'

let IS_TESTNET = process.env.REACT_APP_IS_TESTNET;
if(IS_TESTNET === 'false') IS_TESTNET = false;


let onGetNewSeed = async function () {
    try {
        //this.setState({ error: null });
        let seed = await bip39.generateMnemonic();

        let success = true;

        let output = {success,seed};
        return output
    } catch (error) {
        return error
    }
};

let onBuildWallet = async function (seed) {
    try {
       //console.log"seed: ",seed);
       //console.log"seed: ",typeof(seed));
        //console.log("testnet: ",testnet)
        seed = seed.trim();
        if(!seed) throw Error("empty seed");
        if(seed.length < 10 ) throw Error("bad seed seed");
        //derive account address
        let bufferSeed = await bip39.mnemonicToSeed(seed);
        if(!bufferSeed) throw Error("102: dont create empty seeds bro");

        let path = "m";

        let mkForSigning = HDKey.fromMasterSeed(bufferSeed);

        let childkeyForSigning = mkForSigning.derive(path);

        let keyForSigning = new CoinKey(childkeyForSigning.privateKey);

        let wallet = {
            account:keyForSigning.publicAddress,
            apiKey:keyForSigning.privateWif,

        };
        //console.log(" | onBuildWallet | wallet: ",wallet)

        return wallet
    } catch (error) {
        return error
    }
};




export default {onBuildWallet,onGetNewSeed}