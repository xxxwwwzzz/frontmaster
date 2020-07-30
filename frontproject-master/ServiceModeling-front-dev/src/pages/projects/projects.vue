<template>
  <div>
    <navigate-bar></navigate-bar>
    <diagram-container></diagram-container>
  </div>
</template>

<script>
import NavigateBar from './components/navigateBar'
import DiagramContainer from './components/diagramContainer'

export default {
  name: 'projects',
  components: {DiagramContainer, NavigateBar}
}
</script>

<style lang="scss" scoped>

</style>
