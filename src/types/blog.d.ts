import { AdminRule } from '../models/admin'

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