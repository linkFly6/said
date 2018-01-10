#!/usr/bin/env bash

# 要自己分步执行，因为 bash 远程连接之后就不执行了

# 远程连接 mongoDB
mongo 192.168.99.100:32769/tasaid

# 插入测试数据
# 密码 - test
db.getCollection('admins').insert({ rule: 2, nickName: "test-nickName", password: "dbcb2c2c04edc6e7ae9dcb27d9d101e1153ac52ea3ee3d2f432526d72bb81ca22be36f77303dda85eb8d0683a4559036", username: "test" })

db.getCollection('adminRecords').insert({
  token: "test-token",
  ip: "172.0.0.1",
  headers: "",
  createTime: 1514891331502,
  type: 1,
})