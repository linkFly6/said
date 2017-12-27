import { token, get, user } from '../utils/decorators/route'


export default class {

  @token
  @get
  @user
  public check(params: any) {
    console.log(params.user)
    return {}
  }
}