// 保存 Key
export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// 获取 Key
export function getFromLocalStorage(key) {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

// 移除 Key
export function removeFromLocalStorage(key) {
  localStorage.removeItem(key)
}
