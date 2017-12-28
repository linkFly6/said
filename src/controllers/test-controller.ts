import { get, user } from '../utils/decorators/route'


export default class {
  @get
  @user
  public check(params: any) {
    console.log(params.user)
    return {}
  }
}