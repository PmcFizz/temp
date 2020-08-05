import { get, set, setProperties } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import $ from 'jquery';

export default Component.extend({
  access:           service(),
  cookies:          service(),
  intl:             service(),
  globalStore:      service(),

  waiting:          null,
  username:         null,
  rememberUsername: false,
  password:         null,
  provider:         null,
  readableProvider: null,
  onlyLocal:        null,
  codeimg:          'https://website.deepexi.cloud/images/op-logo@2x.png',
  haveValidate:     false,


  init() {
    this._super(...arguments);

    let username = null;

    if (get(this, 'provider') === 'local') {
      username = get(this, `cookies.${ C.COOKIE.USERNAME }`);
    } else {
      username = get(this, `cookies.${ get(this, 'provider').toUpperCase() }-USERNAME`);
    }

    if ( username ) {
      setProperties(this, {
        username,
        rememberUsername: true,
      });
    }

    if (get(this, 'provider') && !get(this, 'onlyLocal')) {
      let pv = null;

      switch (get(this, 'provider')) {
      case 'activedirectory':
        pv = get(this, 'intl').t('loginPage.readableProviders.ad');
        break;

      case 'openldap':
        pv = get(this, 'intl').t('loginPage.readableProviders.openldap');
        break;

      case 'freeipa':
        pv = get(this, 'intl').t('loginPage.readableProviders.freeipa');
        break;

      case 'azuread':
        pv = get(this, 'intl').t('loginPage.readableProviders.azureAd');
        break;

      case 'local':
      default:
        pv = get(this, 'intl').t('loginPage.readableProviders.local');
        break;
      }

      set(this, 'readableProvider', pv);

      // console.log(this.get('provider'));
    }
  },

  didInsertElement() {
    next(this, 'focusSomething');
    const gs = get(this, 'globalStore');
    const validateToken = (token) => {
      return gs.rawRequest({
        url:    'https://apps.deepexi.cloud/openkuber-service/api/login/auth',
        method: 'POST',
        data:   { token },
      }).then((res) => {
        if (res.body.code === 200) {
          set(this, 'haveValidate', true);
        } else {
          set(this, 'haveValidate', false);
        }
      }).catch(() => {
        set(this, 'haveValidate', false);
      })
    }

    // 使用谷歌验证码进行登录校验
    let script = document.createElement('script');

    script.src = 'https://www.recaptcha.net/recaptcha/api.js?onload=onloadCallback&render=explicit';
    document.querySelector('body').appendChild(script);
    window.onloadCallback = '';
    window.onloadCallback = function() {
      // eslint-disable-next-line no-undef
      grecaptcha.render('google-reCaptcha', {
        'sitekey':  '6Lfdz7kZAAAAAIXntbcb24Mrqn-Lp1rSUDsp74uS', // 生产
        // 'sitekey': '6Ld4rrkZAAAAAF_4bdNXMeN9Hj-zqFu4ULg51lX1', // 本地
        'callback'(token) {
          // 验证成功,将token发送给后端进行二次校验
          validateToken(token)
        },
        'theme': 'light'
      });
    };
  },

  actions: {
    authenticate() {
      const haveValidate = get(this, 'haveValidate');

      if (!haveValidate) {
        alert('请先选择验证码');

        return;
      }
      const username = get(this, 'username');
      let password   = get(this, 'password');
      const remember = get(this, 'rememberUsername');

      if (password && get(this, 'provider') === 'local') {
        password = password.trim();
      }

      const code = {
        username,
        password,
      };

      if ( remember ) {
        if (get(this, 'provider') === 'local') {
          get(this, 'cookies').setWithOptions(C.COOKIE.USERNAME, username, {
            expire: 365,
            secure: 'auto'
          });
        } else {
          get(this, 'cookies').setWithOptions(`${ get(this, 'provider').toUpperCase() }-USERNAME`, username, {
            expire: 365,
            secure: 'auto'
          });
        }
      } else {
        get(this, 'cookies').remove(C.COOKIE.USERNAME);
      }

      set(this, 'password', '');

      if ( get(this, 'access.providers') ) {
        if (this.action) {
          this.action(get(this, 'provider'), code);
        }
      }
    },
    reloadcode() {
      let code = $('#login-verifycode');

      console.log('重新加载验证码', code)
    }
  },

  focusSomething() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let elem = $('#login-username');

    if ( get(this, 'username') ) {
      elem = $('#login-password');
    }

    if ( elem && elem[0] ) {
      elem[0].focus();
    }
  },

  validateToken() {
    set(this, 'haveValidate', true);
    const haveValidate = get(this, 'haveValidate');

    if (!haveValidate) {
      alert('请先选择验证码')

      return
    }
  }


});
