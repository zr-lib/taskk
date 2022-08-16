const colors = require('colors');
const checkPackage = require('../tasks/check-package.js');
const runTasks = require('../tasks/run-tasks.js');

process.send({ type: 'ready' });
process.on('message', async (e) => {
  if (!e.name) return;
  // console.log('worker: ', e.name);
  /** @type {{name: string, tasks: string[], config: TaskkConfig}} */
  const { name, tasks, config } = e;
  try {
    const { cache_cwd, deps_install, node_modules } = config;
    if (cache_cwd && deps_install) {
      const shouldUpdateCache = await checkPackage(name, config);
      if (shouldUpdateCache && node_modules) process.send({ type: 'update_node_modules_cache' });
    }
    const start = Date.now();
    console.log(colors.blue(`[${name}] => ${JSON.stringify(tasks)} => start`));

    await runTasks(config, name, tasks);

    const seconds = (Date.now() - start) / 1000;
    console.log(colors.blue(`\n[${name}] => ${JSON.stringify(tasks)} => done, used:${seconds}s`));

    process.send({ type: 'done', name, succeed: true });
  } catch (err) {
    if (err) console.warn(err);
    process.send({ type: 'done', name, succeed: false });
  }
});
