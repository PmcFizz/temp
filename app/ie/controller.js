import $ from 'jquery';
import { schedule } from '@ember/runloop';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';

export default Controller.extend({
  actions: {
    toTest() {
      this.transitionToRoute('test')
    }
  },
  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      $('#loading-overlay').hide();
      $('#loading-underlay').hide();
    });
  }),
});
