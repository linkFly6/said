#!/usr/bin/env bash

# 要自己分步执行，因为 bash 远程连接之后就不执行了

# 远程连接 mongoDB
mongo 192.168.99.100:32768/tasaid

# 插入测试数据
# 密码 - test/test   [密匙：2222222222]
db.getCollection('admins').insert({ rule: 0, nickName: "test-nickName", password: "1d007cd7d0cd57695adc38e80788e22790d16b5c164059c90b55780506f1520a8820ac19a3ba1fac1e86f177b4ea32b7", username: "test" })
# said 测试用户: said/test
db.getCollection('admins').insert({ rule: 0, nickName: "test-nickName", password: "dbcb2c2c04edc6e7ae9dcb27d9d101e1153ac52ea3ee3d2f432526d72bb81ca22be36f77303dda85eb8d0683a4559036", username: "said" })
# blog 测试用户: blog/test
db.getCollection('admins').insert({ rule: 1, nickName: "test-nickName", password: "dbcb2c2c04edc6e7ae9dcb27d9d101e1153ac52ea3ee3d2f432526d72bb81ca22be36f77303dda85eb8d0683a4559036", username: "blog" })

db.getCollection('adminRecords').insert({
  token: "test-token",
  ip: "172.0.0.1",
  headers: "",
  createTime: 1514891331502,
  type: 1,
})