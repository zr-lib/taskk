//============
// jsDoc
//============

/**
 * @typedef TaskkConfig
 * @property {string} [cache_cwd] 缓存路径，不包含name；与`deps_install`/`node_modules`结合使用
 * @property {string} [deps_install] 依赖安装命令；如`npm install`/`yarn`/`pnpm install`等；
 * 不配置的话，需要手动下载依赖，或者在`tasks`添加依赖下载命令；`cache_cwd`有效时起作用；
 * @property {boolean} [node_modules] 默认false；处理`node_modules`缓存与备份等；`cache_cwd`有效时起作用；
 * @property {'inherit' | 'ignore'} [spawnStdio] 默认`inherit`；spawn执行tasks任务的输出方式
 * @property {boolean} [errorToExit] 默认false；`true`时，任一个 `tasks` 执行失败则会杀死主进程的所有子孙进程；`run_all_done`**不会执行**
 * @property {string} [projectsDir] 默认""；projects相对于顶层的路径；如`packages`，`sub-apps`等
 * @property {string} [projectsDist] 全部执行完成后，projects每个item的output都会复制到这里来
 * @property {boolean} [forceUpdateCache] 有时候node_modules从缓存目录解压不报错，但是项目跑不起来时，此时可以“手动”启用！
 * 将删除缓存重新下载依赖后更新缓存（记住成功后需要关掉，否则后续缓存将不起作用）
 */

/**
 * projects单个数据项格式
 * @typedef ProjectItem
 * @property {string} name 与项目文件夹名保持一致，执行shell命令时需要获取cwd
 * @property {string[]} tasks 需要执行的shell命令列表
 * @property {string} [output] 构建输出的目录名，与config.projectsDist结合使用
 */

/**
 * 执行结果
 * @typedef TaskResult
 * @property {string} type 任务的执行阶段标记
 * @property {string} name 项目名称
 * @property {boolean} succeed 是否成功
 */
