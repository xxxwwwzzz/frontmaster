<template>
  <b-navbar toggleable="lg">
    <b-navbar-brand >
      <img src="../../../assets/WHU.png"  alt="武汉大学" width="50" height="50">
      {{$t('navigateBar.brand')}}
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown :text="$t('navigateBar.language')" right>
          <b-dropdown-item href="" @click.prevent="changeLangCN">{{$t('navigateBar.chinese')}}</b-dropdown-item>
          <b-dropdown-item href="" @click.prevent="changeLangUS">{{$t('navigateBar.english')}}</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown :text="$t('navigateBar.user')" right>
          <b-dropdown-item href="/">{{$t('navigateBar.log-out')}}</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
// TODO: 语言切换 user栏根据用户信息调整显示，还有登出的实现
export default {
  name: 'navigateBar',
  methods: {
    changeLangCN () {
      this.$i18n.locale = 'zh'
    },
    changeLangUS () {
      this.$i18n.locale = 'en'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
