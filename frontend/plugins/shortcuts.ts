import Vue from 'vue';
// @ts-ignore
import ShortKey from 'vue-shortkey';

// add any custom shortkey config settings here
Vue.use(ShortKey, { prevent: ['input', 'textarea'] });

export default ShortKey;
