import * as fs from 'fs'
import * as path from 'path'

/**
 * 循环目录
 * @param dir 
 * @param filter 
 */
export let eachDir = function (dir: string, filter?: RegExp): string[] {
  let results = new Array<string>()
  const list: string[] = fs.readdirSync(dir)
  const pending = list.length
  if (!pending) return list
  list.forEach((file: string): void => {
    if (filter && filter.test(file)) {
      return
    }
    const filePath = path.resolve(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(eachDir(filePath, filter))
    } else {
      results.push(filePath)
    }
  })
  return results
}