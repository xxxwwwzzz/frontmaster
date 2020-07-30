<template>
  <div>
    <navigate-bar></navigate-bar>
    <!-- START SECTION -->
    <div class="section text-center">
      <div class="background-image"></div>
      <b-container>
        <b-row>
          <b-col cols="12">
            <h2 class="product-name">{{$t('index.brand')}}</h2>
            <p class="lead">{{$t('index.intro')}}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col></b-col>
          <b-col>
            <b-row>
              <login-modal class="modal-button"></login-modal>
              <register-modal class="modal-button"></register-modal>
            </b-row>
          </b-col>
          <b-col></b-col>
        </b-row>

      </b-container>
    </div>
  </div>
</template>

<script>
import registerModal from './components/registerModal'
import loginModal from './components/loginModal'
import navigateBar from './components/navigateBar'

export default {
  name: 'index',
  components: {
    navigateBar,
    loginModal,
    registerModal
  }
}
</script>

<style lang="scss" scoped>

  .section {
    background-color: #2c3e50;
    padding-top: 200px;
    padding-bottom: 200px;
    color: #FFF;
    margin: 0;
    border: 0;
    outline: 0;
    font-size: 100%;
    height: 682px;
  }

  .product-name {
    font-size: 36px;
    text-transform: uppercase;
    letter-spacing: 10px;
    font-weight: bold;
    display: inline-block;
    padding: 30px 60px;
    border: 1px solid;
    margin-top: 20px;
    margin-bottom: 10px;
    line-height: 1.1;
  }

  .lead {
    margin: 30px auto 40px;
    font-size: 24px;
    max-width: 70%;
    font-weight: 300;
    line-height: 1.4;
  }

  .background-image {
    position: absolute;
    width: 100%;
    top: 96px;
    left: 0;
    z-index: 0;
    height: 682px;
    background: url(../assets/images/hero.jpg) no-repeat center center;
    background-size: cover;
    opacity: .2;
  }

  .modal-button {
    width: 74px;
    height: 38px;
    margin: 0 auto;
  }
</style>
