# RunningHub ComfyUI 服务

这是一个用于与 RunningHub ComfyUI API 交互的服务封装，提供了图片上传、任务创建和结果获取等功能。

## 功能特点

- 支持图片上传到 RunningHub
- 自动创建和管理 ComfyUI 任务
- 任务状态轮询和结果获取
- 完整的错误处理和重试机制
- 支持自定义工作流配置

## 安装

```bash
npm install
```

## 配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

```env
# RunningHub API Configuration
RUNNINGHUB_API_URL=https://www.runninghub.cn
RUNNINGHUB_API_KEY=your-api-key
RUNNINGHUB_WORKFLOW_ID=your-workflow-id
```

## 使用方法

### 基本使用

```typescript
import RunningHubService from './services/comfyui.service'
import { config } from './config'

// 创建服务实例
const service = new RunningHubService(config)

// 处理图片生成
const result = await service.handleImageGeneration({
  userId: 'user-id',
  imageUrl: 'https://example.com/input-image.jpg'
})

if (result.code === 0) {
  console.log('生成成功：', result.data.imageUrl)
} else {
  console.error('生成失败：', result.msg)
}
```

### 高级配置

服务支持以下配置选项：

```typescript
interface RunningHubConfig {
  apiUrl: string        // RunningHub API 地址
  apiKey: string        // API 密钥
  workflowId: string    // 工作流 ID
  timeouts: {
    operation: number   // 操作超时时间（毫秒）
    upload: number      // 上传超时时间（毫秒）
  }
  retries: {
    upload: number      // 上传重试次数
  }
}
```

## API 说明

### handleImageGeneration(params: TaskParams)

处理图片生成任务。

参数：
- `params.userId`: 用户 ID
- `params.imageUrl`: 输入图片的 URL

返回值：
```typescript
{
  code: number          // 状态码，0 表示成功
  data?: {
    imageUrl: string    // 生成的图片 URL
  }
  msg: string          // 状态消息
}
```

## 错误处理

服务内置了多种错误处理机制：

1. 任务队列满时自动重试：
   - 最大重试次数：10 次
   - 重试间隔：10 秒

2. 任务状态轮询：
   - 最大轮询次数：30 次
   - 轮询间隔：5 秒

3. 详细的错误日志记录：
   - 上传错误
   - 任务创建错误
   - 结果获取错误

## 注意事项

1. 确保 API KEY 已正确配置且有效
2. 工作流 ID 必须对应已在 RunningHub 平台上成功运行过的工作流
3. 输入图片 URL 必须可以公开访问
4. 建议在生产环境中适当调整超时和重试参数

## 测试

运行测试：

```bash
npm run test:runninghub
```

## 示例工作流

服务默认使用节点 ID 为 "40" 的 LoadImage 节点作为图片输入节点。如需使用其他节点或自定义工作流，请相应修改 `createTask` 方法中的 `nodeInfoList` 配置。

## 依赖项

- axios: HTTP 客户端
- form-data: 处理文件上传
- dotenv: 环境变量管理

## 许可证

MIT 