const colors = require('colors');
const { updateNodeModulesCache } = require('../tasks/node-modules-handle.js');

process.send({ type: 'ready' });
process.on('message', async (e) => {
  if (!e.name) return;
  // console.log('worker: ', e.name);
  try {
    /** @type {{name: string, config: TaskkConfig}} */
    const { name, config } = e;
    if (config.cache_cwd) {
      await updateNodeModulesCache(name, config);
    }
    // 父进程未退出则发通知
    if (process.send) process.send({ type: 'done' });
    else process.exit(1);
  } catch (err) {
    console.warn(colors.red(`\n${e.name}, ${err}`));
    process.exit(1);
  }
});
