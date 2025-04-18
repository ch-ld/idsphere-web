// 判断 URL Query 中指定的参数是否存在
export function isEnvEnabled(key) {
  return process.env[key] !== ''
}
