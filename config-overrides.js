const { override, addDecoratorsLegacy } = require('customize-cra');
// 用于重写webpack配置项

module.exports = override(
    addDecoratorsLegacy() // 配置bable decorators plugin
)