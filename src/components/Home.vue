<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <vue-metamask
            userMessage="msg"
            @onComplete="onComplete"
    >
    </vue-metamask>
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
        msg: "This is demo net work"
      }
    },
    methods:{
      onComplete(data){
        console.log('data:', data);
      }
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
