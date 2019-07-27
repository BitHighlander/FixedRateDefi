<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <vue-metamask
            userMessage="msg"
            @onComplete="onComplete"
    >
    </vue-metamask>

    <h2>address:</h2>{{address}}
  </div>
</template>

<script>

  import VueMetamask from 'vue-metamask';

  export default {
    name: 'Home',
    props: {
      msg: String
    },
    components: {
      VueMetamask,
    },
    data(){
      return {
        web3:"",
        msg2: "This is demo network",
        balance:"",
        amount:"",
        address:""
      }
    },
    async mounted(){
      //get info
      try{
        // let address =
        // this.$log.debug("transactions: ",transactions)

        // let web3 = window.web3;
        // this.$log.debug("web3: ",web3.MetaMaskAddress)
        //
        //
        // if (typeof web3 === 'undefined') {
        //   this.web3 = null;
        //   this.$log.debug("No metamask found?: ")
        // } else {
        //   this.web3 = web3
        //
        //   //this.address = this.web3.data.metaMaskAddress
        //   //this.$log.debug("Checkpoint metamask found!: ",this.address)
        // }

        }catch(e){
        this.$log.error("error: ",e)
      }


    },
    methods:{
      onComplete(data){
        console.log('data:', data);
        this.address = data.metaMaskAddress
        this.web3 = data.web3

      },
      checkWeb3() {
        let web3 = window.web3;
        if (typeof web3 === 'undefined') {
          this.web3 = null;
          this.Log(this.MetamaskMsg.METAMASK_NOT_INSTALL, "NO_INSTALL_METAMASK");
        }
      },
      checkAccounts() {
        if (this.web3 === null) return;
        this.web3.eth.getAccounts((err, accounts) => {
          console.log();

          if (err != null) return this.Log(this.MetamaskMsg.NETWORK_ERROR, "NETWORK_ERROR");
          if (accounts.length === 0){
            this.MetaMaskAddress = "";
            this.Log(this.MetamaskMsg.EMPTY_METAMASK_ACCOUNT, 'NO_LOGIN');
            return;
          }
          this.MetaMaskAddress = accounts[0]; // user Address
        });
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
