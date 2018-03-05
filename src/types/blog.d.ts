import { AdminRule } from '../models/admin'
import { IBlog } from '../models/blog'

/**
 * 入参 Blog
 */
export interface SimpleBlog {
  _id?: string
  title: string
  context: string
  summary: string
  tags: string[],
  category: string
  config: {
    script?: string
    css?: string
  }
}


/**
 * 前端输出到前台页面中的文章，会针对日期进行本地化处理
 */
interface IViewBlog extends IBlog {
  info: IBlog['info'] & {
    /**
     * 根据 createTime 修正为日期，格式为 'YYYY-MM-DD HH:mm'
     */
    createTimeString: string,
    /**
     * 针对本地化输出时间
     */
    localDate: string,
    /**
     * 日期：刚才/今天/昨天/前天/xx日
     */
    day: string
    /**
     * HH:mm
     */
    time: string,
    /**
     * YYYY年MM月
     */
    tag: string
  }
}