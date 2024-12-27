# RunningHub ComfyUI 服务开发指南

## 开发环境设置

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp .env.example .env
```
然后编辑 `.env` 文件，填入必要的配置信息。

## 项目结构

```
src/
  ├── server/
  │   ├── config/           # 配置文件
  │   │   └── index.ts
  │   ├── services/         # 服务实现
  │   │   └── comfyui.service.ts
  │   ├── utils/           # 工具函数
  │   │   └── upload.ts
  │   └── test/            # 测试文件
  │       └── runninghub.test.ts
  └── index.ts             # 入口文件
```

## 开发流程

1. 代码风格
- 使用 TypeScript 强类型
- 遵循 ESLint 规则
- 使用 async/await 处理异步
- 添加适当的注释和文档

2. 错误处理
- 使用 try/catch 捕获异常
- 提供详细的错误信息
- 实现错误重试机制
- 记录错误日志

3. 测试
- 运行单元测试：`npm test`
- 运行集成测试：`npm run test:runninghub`
- 添加新功能时编写对应测试

## 功能扩展

### 添加新的节���支持

1. 在 `createTask` 方法中添加新的节点配置：

```typescript
const nodeInfoList = [
  {
    nodeId: "40",    // LoadImage 节点
    fieldName: "image",
    fieldValue: imageName
  },
  {
    nodeId: "新节点ID",
    fieldName: "参数名",
    fieldValue: "参数值"
  }
]
```

### 自定义错误处理

1. 添加新的错误类型：

```typescript
interface CustomError extends Error {
  code: number
  details?: any
}
```

2. 实现错误处理：

```typescript
try {
  // 业务逻辑
} catch (error) {
  if (error.code === 特定错误码) {
    // 特定错误处理
  }
  throw error
}
```

### 添加新的 API 方法

1. 在 `RunningHubService` 类中添加新方法：

```typescript
async newFeature(params: NewFeatureParams): Promise<NewFeatureResult> {
  try {
    // 实现新功能
    return {
      code: 0,
      data: result,
      msg: 'success'
    }
  } catch (error) {
    return {
      code: -1,
      msg: error.message
    }
  }
}
```

## 性能优化

1. 图片处理
- 使用流式处理大文件
- 实现图片压缩
- 清理临时文件

2. 请求优化
- 实现请求缓存
- 控制并发数
- 优化轮询策略

3. 内存管理
- 及时释放资源
- 控制缓存大小
- 避免内存泄漏

## 部署

1. 构建
```bash
npm run build
```

2. 运行
```bash
npm start
```

3. 使用 PM2 部署
```bash
pm2 start dist/index.js --name runninghub-service
```

## 监控和日志

1. 日志记录
- 使用 Winston 记录日志
- 区分错误级别
- 记录关键操作

2. 性能监控
- 记录响应时间
- 监控内存使用
- 跟踪错误率

3. 告警设置
- 设置错误阈值
- 配置告警通知
- 记录异常情况

## 安全措施

1. 输入验证
- 验证所有输入参数
- 防止注入攻击
- 限制文件大小

2. 认证和授权
- 验证 API KEY
- 控制访问权限
- 记录访问日志

3. 数据保护
- 加密敏感信息
- 安全传输数据
- 定期清理数据

## 贡献指南

1. 提交代码
- 创建功能分支
- 编写单元测试
- 提交 Pull Request

2. 代码审查
- 遵循代码规范
- 确保测试通过
- 更新文档

3. 版本发布
- 遵循语义化版本
- 更新更新日志
- 标记发布版本

## 常见问题

1. 图片上传失败
- 检查文件格式
- 验证文件大小
- 确认网络连接

2. 任务创建失败
- 验证工作流 ID
- 检查节点配置
- 确认 API KEY

3. 结果获取超时
- 增加重试次数
- 调整轮询间隔
- 检查任务状态 