import { get } from '../filters/http'
import { admin } from '../filters/backend'


export default class {
  @get
  @admin
  public check(params: any) {
    console.log(params.user)
    return {}
  }
}