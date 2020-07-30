<template>
  <div v-if="($route.query.createTime < '2019-12-18T21:00:00') || ($route.query.diagramType !== 'BPMN')">
  <div>
    <b-p-m-n v-if="$route.query.diagramType==='BPMN'"></b-p-m-n>
    <c-s-d-m v-if="$route.query.diagramType !=='Sequence'"></c-s-d-m>
    <sequence v-else></sequence>
  </div>
  </div>
</template>
<script>
import CSDM from './CSDM'
import BPMN from './BPMN'

import sequence from './sequence'

export default {
  name: 'workspace',
  components: {BPMN, CSDM,sequence   },
  created () {
    if ((this.$route.query.createTime > '2019-12-18T21:00:00') && (this.$route.query.diagramType === 'BPMN')) {
      window.location.href = '../static/modeler.html?modelId=' + this.$route.query.id
    }
  }
}
</script>

<style lang="scss" scoped></style>
