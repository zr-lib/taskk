//============
// jsDoc
//============

/**
 * @typedef TaskkConfig
 * @property {string} [cache_cwd] Cache path, without name; used with `deps_install`/`node_modules`
 * @property {string} [deps_install] Dependency installation command, such as `npm install`/`yarn`/`pnpm install`;
 * Detect `package.json` update and re download dependency;
 * If it is not configured, you need to manually download the dependency, or add a dependency download command in `tasks`;
 * works when `config.cache_cwd` is in effect
 * @property {boolean} [node_modules] Default false;Process `node_modules` cache and backup, etc; works when `config.cache_cwd` is in effect
 * @property {'inherit' | 'ignore'} [spawnStdio] Default `inherit`;The output method of spawn executing tasks task
 * @property {boolean} [errorToExit] Default false;
 * When `true`, any `tasks` execution failure will kill all descendant processes of the main process, `run_all_done` **will not be executed**
 * @property {string} [projectsDist] After all the projects are executed, the `output` of each item will be copied here
 * @property {boolean} [forceUpdateCache] Sometimes `node_modules` unzip from the cache directory without error, but when the project cannot run, you can **temporarily set true**;
 * The cache will be deleted and updated after the dependency is re downloaded (remember to **set false** after success, otherwise the subsequent cache will **not work**!)
 */

/**
 * projects item type
 * @typedef ProjectItem
 * @property {string} name Keep consistent with the project folder name. When executing the `shell` command, you need to obtain the `cwd`
 * @property {string[]} tasks List of `shell` commands to be executed
 * @property {string} [output] The directory name of the output of the execution build, used with `config.projectsdist`
 */

/**
 * projects result
 * @typedef TaskResult
 * @property {string} type Execution stage flag of the task
 * @property {string} name Project name
 * @property {boolean} succeed Success or not
 */
