const { execSync } = require('child_process');
const { statSync, readFileSync, existsSync, writeFileSync, mkdirSync } = require('fs');
const path = require('path');
const colors = require('colors');
const depsInstall = require('./deps-install.js');
const { getNodeModulesFromCache } = require('./node-modules-handle.js');

/**
 * 检查package.json变化,node-modules缓存与更新处理
 * @param {string} name
 * @param {TaskkConfig} config
 */
module.exports = function checkPackage(name, config) {
  if (!config.cache_cwd || !config.deps_install) return Promise.resolve();

  const projects_cwd = path.resolve(process.cwd(), config.projectsDir);
  const last_package_info = getLastPackageMtime(config.cache_cwd, name);

  return new Promise(async (resolve, reject) => {
    try {
      const package_json_path = path.join(projects_cwd, name, 'package.json');
      if (!existsSync(package_json_path)) {
        console.warn(colors.red(`[${name}] => 项目不存在`));
        return reject();
      }
      // 缓存解压缩正常，但是项目跑不起来时可用
      if (config.forceUpdateCache && existsSync(`${config.cache_cwd}/${name}`)) {
        execSync(`rm -r ${config.cache_cwd}/${name}`);
      }
      const currentMtime = statSync(package_json_path).mtimeMs;
      const lastMtime = last_package_info.mtime;
      let shouldUpdateCache = false;

      if (lastMtime !== currentMtime) {
        if (lastMtime) {
          const currentTimeStr = new Date(currentMtime).toLocaleString();
          const lastTimeStr = new Date(lastMtime).toLocaleString();
          const str = `\n[${name}] => package.json有修改, current: ${currentTimeStr}, last: ${lastTimeStr}\n`;
          console.log(colors.blue(str));
        }

        last_package_info['name'] = name;
        last_package_info['mtime'] = currentMtime;

        console.log(colors.blue(`[${name}] => 正在下载依赖`));
        await depsInstall(name, config);

        shouldUpdateCache = true;
      } else {
        // console.log(colors.blue(`[${name}] => package.json无变化`));
        const cache_target = `${config.cache_cwd}/${name}/node_modules.tar.gz`;
        if (!existsSync(`${projects_cwd}/${name}/node_modules`)) {
          if (config.node_modules && existsSync(cache_target)) {
            const text = `[${name}] => 不存在node_modules，存在缓存文件，正在从缓存目录解压`;
            console.log(colors.blue(text));

            await getNodeModulesFromCache(name, config);
          } else {
            const cacheStr = config.node_modules ? '不存在缓存文件，' : '';
            const text = `[${name}] => 不存在node_modules，${cacheStr}正在下载依赖`;
            console.log(colors.blue(text));

            await depsInstall(name, config);

            shouldUpdateCache = true;
          }
        } else {
          if (config.node_modules && !existsSync(cache_target)) shouldUpdateCache = true;
        }
      }

      if (shouldUpdateCache) {
        const new_package_info = JSON.stringify(last_package_info, null, 4);
        updatePackageInfo(config.cache_cwd, name, new_package_info);
      }

      resolve(shouldUpdateCache);
    } catch (err) {
      console.warn(err);
      reject();
    }
  });
};

const pagkage_info_file = 'last_package_info.json';
/**
 * 处理pagkage_info_file
 * @param {string} cache_cwd
 * @param {string} name
 * @returns
 */
function getLastPackagePath(cache_cwd, name) {
  const parentDir = path.resolve(cache_cwd, name);
  if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true });
  return path.resolve(parentDir, pagkage_info_file);
}

/**
 * 获取上次构建时package.json的信息
 * @param {string} cache_cwd
 * @param {string} name
 * @returns
 */
function getLastPackageMtime(cache_cwd, name) {
  const file_path = getLastPackagePath(cache_cwd, name);
  if (!existsSync(file_path)) return {};
  const data = readFileSync(file_path, { encoding: 'utf-8' });
  return JSON.parse(data);
}

/**
 * 更新信息
 * @param {string} cache_cwd
 * @param {string} name
 * @param {string} data
 */
function updatePackageInfo(cache_cwd, name, data) {
  const file_path = getLastPackagePath(cache_cwd, name);
  // console.log(name, data, file_path);
  writeFileSync(file_path, data, { encoding: 'utf-8' });
}
