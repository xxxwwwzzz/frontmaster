<template>
  <div>
    <b-button class="globalRegisterBtn" v-b-modal="'register-modal'">{{$t('registerModal.register')}}</b-button>

    <b-modal id="register-modal" centered size="lg" hide-footer>
      <b-row>
        <b-col id="col-left"></b-col>
        <b-col>
          <b-form class="text-center" @submit.prevent>
            <b-form-group label-for="id-account">
              <b-form-input id="id-account" v-model="form.account" maxlength="50" name="email"
                            :placeholder="$t('registerModal.ph-account')" type="text"></b-form-input>
            </b-form-group>
            <b-form-group label-for="id-password">
              <b-form-input id="id-password" v-model="form.password" name="password" :placeholder="$t('registerModal.ph-password')"
                            type="password"></b-form-input>
            </b-form-group>
            <b-form-group label-for="id-password-comfirm">
              <b-form-input id="id-password-comfirm" v-model="form.passwordConfirm" name="password" :placeholder="$t('registerModal.ph-password-comfirm')"
                            type="password"></b-form-input>
            </b-form-group>
          </b-form>

          <div>
            <b-button block id="register-btn" @click="register">{{$t('registerModal.register')}}</b-button>
            <div :style="{'display':showTip? 'block':'none'}" class="tips-error">{{errorDesc}}</div>
          </div>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'registerModal',
  data () {
    return {
      form: {
        account: '',
        password: '',
        passwordConfirm: ''
      },
      showTip: false,
      errorDesc: ''
    }
  },
  methods: {
    hideModal (e) {
      this.$bvModal.hide('register-modal')
    },
    resetModal (e) {
      e.preventDefault()
      this.form.account = ''
      this.form.password = ''
      this.form.passwordConfirm = ''
      this.showTip = false
      this.errorDesc = ''
    },
    register () {
      this.$ajax.post('api/user/register', {
        'password': this.form.password,
        'email': this.form.account
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.errorDesc = response.data.message + '3秒后将关闭注册框'
            this.showTip = true
            setTimeout(() => { this.hideModal() }, 3000)
          } else {
            this.errorDesc = response.data.message
            this.showTip = true
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>

  .globalRegisterBtn {
    display: block;
    height: 38px;
    line-height: 38px;
    padding: 0 18px;
    background-color: #009688;
    color: #fff;
    white-space: nowrap;
    text-align: center;
    font-size: 14px;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    opacity: .9;
    filter: alpha(opacity=90);
  }

  #col-left {
    width: 225px;
    height: 450px;
    background: url(../../assets/images/logo.png) 50% 50% no-repeat
  }
  .tips-error{
    padding:2px 10px;margin-top:10px;color:#FFFFFF;background-color:#f2dede
  }
  #register-btn {
    height: 47px;
    padding: 0 18px;
    color: #fff;
    font-size: 18px;
    background: #5ecfba linear-gradient(#1fd783, #1fd06b);
  }
</style>
