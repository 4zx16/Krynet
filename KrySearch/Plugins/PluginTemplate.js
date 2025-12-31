
/* KrySearch Feature Plugin Template
 * Rules:
 * - No storage
 * - No fetch / XHR
 * - No eval
 * - No DOM injection outside body
 */

(function () {
  const plugin = {
    id: "plugin-id",
    description: "What this plugin does",

    run(ctx) {
      // ctx = shared immutable context
    }
  }

  window.KRY_PLUGINS = window.KRY_PLUGINS || []
  window.KRY_PLUGINS.push(plugin)
})()
