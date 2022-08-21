const { existsSync, mkdirSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const colors = require('colors');
const tar = require('tar');

/**
 * 从缓存目录解压node_modules
 * @param {string} name 当前项目名称
 * @param {TaskkConfig} config 配置
 */
exports.getNodeModulesFromCache = async function getNodeModulesFromCache(name, config) {
  const { cache_cwd, projectsDir } = config;
  console.log(colors.blue(`\n[${name}] => getNodeModulesFromCache===start\n`));
  const start = Date.now();

  const to_cwd = path.join(process.cwd(), projectsDir, name);
  const from_target = path.join(cache_cwd, name, 'node_modules.tar.gz');
  const to_target = path.join(to_cwd, 'node_modules');

  if (!existsSync(from_target)) {
    console.warn(colors.red(`路径不存在: ${from_target}`));
    return Promise.reject();
  }

  return new Promise(async (resolve, reject) => {
    try {
      console.log(`${from_target} \n解压到 ${to_cwd}\n`);
      await tar.x({ gzip: true, file: from_target, C: to_cwd });
      // execSync(`tar --force-local -xjf ${from_target} -C ${to_cwd}`);
      resolve();
      const seconds = (Date.now() - start) / 1000;
      console.log(
        colors.blue(`\n[${name}] => getNodeModulesFromCache===done, 耗时：${seconds}s\n`)
      );
    } catch (err) {
      // 解压失败，可能是压缩文件有问题，删除压缩压缩文件与复制的node_modules
      const warnStr =
        '缓存文件解压失败，将删除，再次执行即可自动检测下载依赖！或尝试临时启用forceUpdateCache';
      console.warn(colors.yellow(warnStr));
      execSync(`rm -rf ${cache_cwd}/${name}`);
      existsSync(to_target) && execSync(`rm -rf ${to_target}`);
      reject();
    }
  });
};

/**
 * 更新缓存目录的node_modules压缩包
 * @param {string} name 当前项目名称
 * @param {TaskkConfig} config 配置
 */
exports.updateNodeModulesCache = async function updateNodeModulesCache(name, config) {
  const { cache_cwd, projectsDir } = config;
  console.log(colors.blue(`\n[${name}] => updateNodeModulesCache===start\n`));
  const start = Date.now();

  const from_cwd = path.resolve(process.cwd(), projectsDir, name);
  const to_cwd = path.resolve(cache_cwd, name);
  const from_target = path.resolve(from_cwd, 'node_modules');
  const to_target = path.resolve(to_cwd, 'node_modules.tar.gz');
  console.log(`${from_target} \n压缩到 ${to_target}\n`);

  return new Promise(async (resolve, reject) => {
    if (existsSync(from_target)) {
      try {
        // 创建文件夹路径
        if (!existsSync(to_cwd)) mkdirSync(to_cwd, { recursive: true });
        if (existsSync(to_target)) execSync(`rm -rf ${to_target}`);

        // 保存为压缩包，可以保留.bin下的软链
        // execSync(`tar --force-local -cjf ${to_target} node_modules`, { cwd: from_cwd });
        await tar.c({ gzip: true, file: to_target, cwd: from_cwd }, ['node_modules']);
        resolve();
        const seconds = (Date.now() - start) / 1000;
        console.log(
          colors.blue(`\n[${name}] => updateNodeModulesCache===done, 耗时：${seconds}s\n`)
        );
      } catch (err) {
        reject(err);
        throw err;
      }
    } else {
      console.warn(colors.red(`路径不存在: ${from_target}`));
    }
  });
};
