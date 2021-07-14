// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  window.jQuery = window.$ = require('./static/js/jquery-3.6.0.min.js')
  require('./static/js/semantic.min.js')
  require('./renderer.js')
})
