# RunningHub ComfyUI API 接口文档

## 基础信息

- 基础URL: `https://www.runninghub.cn`
- API KEY: 在 RunningHub 平台获取
- Content-Type: 
  - 文件上传: `multipart/form-data`
  - 其他请求: `application/json`

## 接口列表

### 1. 上传图片

上传图片到 RunningHub 平台。

```
POST /task/openapi/upload
```

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| apiKey | string | 是 | API 密钥 |
| file | file | 是 | 图片文件 |
| fileType | string | 是 | 文件类型，固定值 "image" |

#### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "fileName": "api/xxxxx.png",
    "fileType": "image"
  }
}
```

### 2. 创建任务

创建图片处理任务。

```
POST /task/openapi/create
```

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| workflowId | string | 是 | 工作流 ID |
| apiKey | string | 是 | API 密钥 |
| nodeInfoList | array | 是 | 节点信息列表 |

nodeInfoList 结构：
```json
{
  "nodeId": "40",
  "fieldName": "image",
  "fieldValue": "api/xxxxx.png"
}
```

#### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "taskId": "1872491503498231809",
    "clientId": "22b7e2a527f494205e18c62faf0b7264",
    "taskStatus": "RUNNING",
    "promptTips": "{\"node_errors\": {}}"
  }
}
```

### 3. 获取任务结果

查询任务执行结果。

```
POST /task/openapi/outputs
```

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 是 | 任务 ID |
| apiKey | string | 是 | API 密钥 |

#### 响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "fileUrl": "https://xxx.com/xxx.png",
      "fileType": "png",
      "taskCostTime": "4"
    }
  ]
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 0 | 成功 |
| 301 | 参数无效 |
| 421 | 任务队列已满 |
| 804 | 任务正在运行 |

## 错误处理

1. 任务队列已满 (421)
   - 建议：等待一段时间后重试
   - 默认重试间隔：10秒
   - 最大重试次数：10次

2. 参数无效 (301)
   - 检查参数是否完整
   - 确保 API KEY 有效
   - 验证文件格式是否正确

3. 任务运行中 (804)
   - 继续轮询任务状态
   - 默认轮询间隔：5秒
   - 最大轮询次数：30次

## 使用建议

1. 图片上传
   - 支持的图片格式：PNG、JPG
   - 建议图片大小不超过 10MB
   - 使用 multipart/form-data 格式上传

2. 任务创建
   - 确保工作流已在平台上成功运行过
   - 正确配置节点参数
   - 处理任务队列满的情况

3. 结果获取
   - 实现合适的轮询策略
   - 处理超时情况
   - 保存和验证结果URL

## 安全建议

1. API KEY 保护
   - 不要在客户端暴露
   - 定期更换
   - 使用环境变量管理

2. 请求验证
   - 验证响应状态
   - 检查返回数据完整性
   - 记录错误日志

3. 资源管理
   - 及时清理临时文件
   - 控制并发请求数
   - 实现请求超时处理 