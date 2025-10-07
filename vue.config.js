const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: [
    'axios',
    'some-ui-lib'

    
  ],


  chainWebpack: config => {
    // Disable the problematic progress plugin
    config.plugins.delete('progress')
  },


})
