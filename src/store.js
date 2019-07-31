import Vue from 'vue'
import Vuex from 'vuex'
import getWeb3 from './util/getWeb3'
const Promise = require("bluebird");

let token = "MEESH"
let abiInfo = require("./coins/"+token.toUpperCase()+".abi.js")
import openSocket from 'socket.io-client';

/*
    TODO update web3 to 1.0 and integrate sockets


    //Fuck pollweb3
 */

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    web3: {
      isInjected: false,
      web3Instance: null,
      networkId: null,
      coinbase: null,
      balance: null,
      fomo: null,
      error: null
    },
    contractInstance: null
  },
  mutations: {
    async registerWeb3Instance (state, payload) {
      console.log('registerWeb3instance Mutation being executed', payload)
      let result = payload
      let web3Copy = state.web3
      web3Copy.coinbase = result.coinbase
      web3Copy.networkId = result.networkId
      web3Copy.balance = parseInt(result.balance, 10)
      web3Copy.isInjected = result.injectedWeb3
      web3Copy.web3Instance = result.web3


      //
      let ABI = abiInfo.ABI
      let metaData = abiInfo.metaData

      //
      let abiInterface = web3.eth.contract(ABI);
      console.log("abiInterface: ",abiInterface)

      let contract = abiInterface.at(metaData.contractAddress);

      let getBalance = Promise.promisify(contract.balanceOf.call);


      let balance = await getBalance(result.coinbase, "pending")
      console.log("balance: ",balance)

      web3Copy.fomo = balance.toNumber()/metaData.BASE


      state.web3 = web3Copy
      //pollWeb3()
    },
  },
  actions: {
    registerWeb3 ({commit}) {
      console.log('registerWeb3 Action being executed')
      getWeb3.then(result => {
        console.log('committing result to registerWeb3Instance mutation')
        commit('registerWeb3Instance', result)
      }).catch(e => {
        console.log('error in action registerWeb3', e)
      })
    },
    async startSockets(){
      let tag = " | startSockets | ";
      try{
        // let socket = openSocket(domain, {reconnect: true, rejectUnauthorized: false})
        // this.socket.on('predictions', async function (message) {
        //   let tag = " | SOCKET.IO | " + " | predictions | ";
        //   try {
        //
        //     this.$log.debug('orderUpdate: ', message);
        //     this.$log.debug('orderUpdate: ', typeof(message));
        //     if(typeof(message)==="string") message = JSON.parse(message);
        //     this.$toasted.show(message.message)
        //     //chingle!
        //     //daemon.playChingle()
        //
        //
        //   } catch (e) {
        //     console.error(tag,"ERROR: ",e)
        //   }
        // }.bind(this));
        //
        // this.socket.on('reconnect',async function(){
        //   this.announce();
        //   this.socketId = this.socket.id
        // }.bind(this));
        //
        // /*
        //   PRICE feed
        // */
        //
        // this.socket.on('prices', function(message) {
        //   //update price
        //   //this.$log.debug('price: ', message);
        //
        //   this.currentPrice = message.price;
        //
        //   //push to chart
        //   this.pushPointChart(message.time,message.price)
        // }.bind(this));
        //
        // this.socket.on('forcasts', function(message) {
        //
        // }.bind(this));
        //
        // this.socket.on('results', function(message) {
        //
        // }.bind(this));
        //
        // /***************************************
        //  //CHAT
        //  //**************************************/
        // this.socket.on('messages', function(message) {
        //   this.messages.push(message);
        //   //this.updateScroll()
        // }.bind(this));
        // this.socket.on('member_add', function(member) {
        //   //Vue.set(this.members, member.socket, member);
        // }.bind(this));
        // this.socket.on('member_delete', function(socket_id) {
        //   //Vue.delete(this.members, socket_id);
        // }.bind(this));
        // this.socket.on('message_history', function(messages) {
        //   this.messages = messages;
        // }.bind(this));

      }catch(e){
        //this.$log.error(tag,'error',e);
        let errorMessage = " Failed to start sockets! ";
        //this.error = errorMessage;
        throw Error(errorMessage)
      }
    },
  }
})
