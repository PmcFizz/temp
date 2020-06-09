import $ from 'jquery';
import { schedule } from '@ember/runloop';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';

export default Controller.extend({
  actions: {
    toLogin() {
      this.transitionToRoute('login')
    }
  },
  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      $('#loading-overlay').hide();
      $('#loading-underlay').hide();
    });
  }),
});
