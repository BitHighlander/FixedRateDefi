<template>
  <div class="row">

<!--    <SortedTable :values="values">-->
<!--      <thead>-->
<!--      <tr>-->
<!--        <th scope="col" style="text-align: left; width: 10rem;">-->
<!--          <SortLink name="id">ID</SortLink>-->
<!--        </th>-->
<!--        <th scope="col" style="text-align: left; width: 10rem;">-->
<!--          <SortLink name="name">Name</SortLink>-->
<!--        </th>-->
<!--        <th scope="col" style="text-align: left; width: 10rem;">-->
<!--          <SortLink name="hits">Hits</SortLink>-->
<!--        </th>-->
<!--      </tr>-->
<!--      </thead>-->
<!--      <tbody slot="body" slot-scope="sort">-->
<!--      <tr v-for="value in sort.values" :key="value.id">-->
<!--        <td>{{ value.id }}</td>-->
<!--        <td>{{ value.name }}</td>-->
<!--        <td>{{ value.hits }}</td>-->
<!--      </tr>-->
<!--      </tbody>-->
<!--    </SortedTable>-->


    <div class="col-12">
      <card :title="table1.title">
        <div class="table-responsive">

          <SortedTable :values="table1.data">
            <thead>
            <tr>
              <th scope="col" style="text-align: left; width: 10rem;">
                <SortLink name="fixedRate">fixedRate</SortLink>
              </th>
              <th scope="col" style="text-align: left; width: 10rem;">
                <SortLink length="length">Term length</SortLink>
              </th>
              <th scope="col" style="text-align: left; width: 10rem;">
                <SortLink name="contractLink">contractLink</SortLink>
              </th>
            </tr>
            </thead>
            <tbody slot="body" slot-scope="sort">
            <tr v-for="value in sort.values" :key="value.fixedRate">
              <td>{{ value.fixedRate }}</td>
              <td>{{ value.length }}</td>
              <td>{{ value.contractLink }}</td>
            </tr>
            </tbody>
          </SortedTable>

<!--          <base-table :data="table1.data"-->
<!--                      :columns="table1.columns"-->
<!--                      thead-classes="text-primary">-->
<!--          </base-table>-->
        </div>
      </card>
    </div>

  </div>
</template>
<script>
  import { BaseTable } from "@/components";
  const tableColumns = ["length", "Country", "City", "fixedRate"];
  const tableData = [
    {
      id: 1,
      length: "1 year",
      fixedRate: '7.38%',
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    },
    {
      id: 2,
      length: "1 year",
      fixedRate: '6.39%',
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    },
    {
      id: 3,
      length: "1 year",
      fixedRate: '6.28%',
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    },
    {
      id: 4,
      length: "1 year",
      fixedRate: '6.18%',
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    },
    {
      id: 5,
      length: "1 year",
      fixedRate: '6.18%',
      currency: "cDai",
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    },
    {
      id: 6,
      length: "6 months",
      fixedRate: '7.38%',
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    },
    {
      id: 7,
      length: '3 months',
      fixedRate: '9.38%',
      collaterlized: "true",
      contractLink:"https://etherscan.io/address/0x065c7140a9c5c94843ebd765273bd4b9dc282e66"
    }
  ];


  export default {
    name: 'starter-page',
    components: {
      BaseTable
    },
    data() {
      return {
        values: [
          { name: "Plugin Foo", id: 2, hits: 33 },
          { name: "Plugin Bar", id: 1, hits: 42 },
          { name: "Plugin Foo Bar", id: 3, hits: 79 }
        ],
        table1: {
          title: "Available contracts",
          columns: [...tableColumns],
          data: [...tableData]
        },

      };
    }
  };
</script>
<style></style>
