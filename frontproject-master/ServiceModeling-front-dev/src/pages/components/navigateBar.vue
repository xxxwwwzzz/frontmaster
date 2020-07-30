<template>
    <b-navbar id="nab" toggleable="lg">
      <b-navbar-brand id="brand">
        <img src="../../assets/WHU.png" alt="武汉大学" width="50" height="50">
        {{$t('navigateBar.brand')}}</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-button squared variant="primary" @click.prevent="changeLang" id="language_btn" right>{{$t('navigateBar.btn-lang')}}</b-button>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

</template>

<script>

export default {
  name: 'navigateBar',
  methods: {
    changeLang () {
      let locale = this.$i18n.locale
      locale === 'zh' ? this.$i18n.locale = 'en' : this.$i18n.locale = 'zh'
    }
  }
}
</script>

<style lang="scss" scoped>

  #brand {
    line-height: 80px;
    font-weight: bold;
    height: 80px;
    padding: 0 15px;
    font-size: 24px;
    letter-spacing: -0.05em;
    color: #2c3e50;
  }
  #language_btn{
    background: #5ecfba;
    border-radius: 0;
    text-transform: uppercase;
    font-weight: bold;
    border: none;
    font-size: 12px;
    padding: 0 30px;
    line-height: 50px;
  }
  #language_btn.focus, #language_btn:focus, #language_btn:hover {
    color: #333;
    text-decoration: none;
  }
</style>
