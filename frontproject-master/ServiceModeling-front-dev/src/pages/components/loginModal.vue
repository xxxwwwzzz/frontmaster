<template>
  <div>
    <b-button class="globalLoginBtn" v-b-modal="'login-modal'">{{$t('loginModal.login')}}</b-button>

    <b-modal id="login-modal" centered size="lg" hide-footer>
      <b-row>
        <b-col id="col-left"></b-col>
        <b-col>
          <b-form class="text-center" @submit.prevent>
            <b-form-group label-for="id-account">
              <b-form-input id="id-account" v-model="form.account" maxlength="50" name="mailOrName"
                            :placeholder="$t('loginModal.ph-account')" type="text"></b-form-input>
            </b-form-group>
            <b-form-group label-for="id-password">
              <b-form-input id="id-password" v-model="form.password" name="password"
                            :placeholder="$t('loginModal.ph-password')" type="password"></b-form-input>
            </b-form-group>
          </b-form>

          <p style="color: #b2b2b2;font-size: 14px">{{$t('loginModal.noAccount')}}<a href="#" style="color: #ff9600;">{{$t('loginModal.registerNow')}}</a>
          </p>

          <div>
            <b-button block id="login-btn" @click="login">{{$t('loginModal.login')}}</b-button>
            <div :style="{'display':showTip? 'block':'none'}" class="tips-error">{{errorDesc}}</div>
          </div>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>

export default {
  name: 'loginModal',
  data () {
    return {
      form: {
        account: '',
        password: ''
      },
      showTip: false,
      errorDesc: ''
    }
  },
  methods: {
    resetModal (e) {
      e.preventDefault()
      this.form.account = ''
      this.form.password = ''
      this.showTip = false
      this.errorDesc = ''
    },
    login () {
      this.$ajax.get('api/user/login', {
        params: {
          'password': this.form.password,
          'email': this.form.account
        }})
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            localStorage.token = response.data.data
            this.$router.push({path: 'projects'})
          } else {
            this.errorDesc = response.data.message
            this.showTip = true
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  mounted () {
    this.resetModal()
  }
}

</script>

<style lang="scss" scoped>

  .globalLoginBtn {
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

  .tips-error {
    padding: 2px 10px;
    margin-top: 10px;
    color: #FFFFFF;
    background-color: #f2dede
  }

  #login-btn {
    height: 47px;
    padding: 0 18px;
    color: #fff;
    font-size: 18px;
    background: #5ecfba linear-gradient(#1fd783, #1fd06b);
  }
</style>
