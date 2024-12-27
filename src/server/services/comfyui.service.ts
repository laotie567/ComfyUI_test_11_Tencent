import { RunningHubConfig } from '../config'
import { uploadToCloud } from '../utils/upload'
import FormData from 'form-data'
import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

interface TaskParams {
  userId: string
  imageUrl: string
}

interface TaskResponse {
  code: number
  msg: string
  data: {
    taskId: string
    clientId: string
    taskStatus: 'QUEUED' | 'RUNNING' | 'SUCCEED' | 'FAILED'
    promptTips: string
  }
}

interface OutputResponse {
  code: number
  msg: string
  data: Array<{
    fileUrl: string
    fileType: string
  }>
}

class RunningHubService {
  private config: RunningHubConfig
  private readonly MAX_RETRIES = 30
  private readonly POLLING_INTERVAL = 5000

  constructor(config: RunningHubConfig) {
    this.config = config
  }

  private async uploadImage(imageUrl: string): Promise<string> {
    try {
      // 1. 下载图片
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      })
      const buffer = Buffer.from(imageResponse.data)
      
      // 2. 保存临时文件
      const tempDir = path.join(__dirname, '..', '..', '..', 'temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      const tempFile = path.join(tempDir, 'temp.png')
      fs.writeFileSync(tempFile, buffer)
      
      // 3. 准备表单数据
      const form = new FormData()
      form.append('apiKey', this.config.apiKey)
      form.append('file', fs.createReadStream(tempFile), {
        filename: 'temp.png',
        contentType: 'image/png'
      })
      form.append('fileType', 'image')

      console.log('Uploading with form data:', {
        apiKey: this.config.apiKey,
        fileType: 'image'
      })

      // 4. 上传到 RunningHub
      const uploadResponse = await axios.post(
        `${this.config.apiUrl}/task/openapi/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )

      // 5. 清理临时文件
      fs.unlinkSync(tempFile)

      const result = uploadResponse.data
      console.log('Upload response:', result)

      if (result.code !== 0) {
        console.error('Upload failed with response:', result)
        throw new Error(result.msg || 'Upload failed')
      }

      return result.data.fileName
    } catch (error: any) {
      if (error.response) {
        console.error('Upload error response:', error.response.data)
      }
      console.error('Upload image error:', error.message)
      throw error
    }
  }

  private async createTask(imageName: string): Promise<string> {
    let retries = 0
    const MAX_CREATE_RETRIES = 10
    const CREATE_RETRY_INTERVAL = 10000 // 10 seconds

    while (retries < MAX_CREATE_RETRIES) {
      try {
        const body = {
          workflowId: this.config.workflowId,
          apiKey: this.config.apiKey,
          nodeInfoList: [
            {
              nodeId: "40", // LoadImage 节点
              fieldName: "image",
              fieldValue: imageName
            }
          ]
        }

        console.log('Create task request:', body)

        const response = await axios.post(
          `${this.config.apiUrl}/task/openapi/create`,
          body,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        const result = response.data as TaskResponse
        console.log('Create task response:', result)

        if (result.code === 421) { // TASK_QUEUE_MAXED
          console.log(`Task queue full, retrying in ${CREATE_RETRY_INTERVAL/1000} seconds... (${retries + 1}/${MAX_CREATE_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, CREATE_RETRY_INTERVAL))
          retries++
          continue
        }

        if (result.code !== 0) {
          throw new Error(result.msg || 'Task creation failed')
        }

        return result.data.taskId
      } catch (error) {
        console.error('Create task error:', error)
        throw error
      }
    }

    throw new Error('Failed to create task after maximum retries')
  }

  private async getTaskResult(taskId: string): Promise<string> {
    let retries = 0

    while (retries < this.MAX_RETRIES) {
      try {
        const response = await axios.post(
          `${this.config.apiUrl}/task/openapi/outputs`,
          {
            taskId,
            apiKey: this.config.apiKey
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        const result = response.data as OutputResponse
        console.log('Get task result:', result)

        if (result.code === 0 && result.data.length > 0) {
          return result.data[0].fileUrl
        }

        // 如果任务还未完成，等待后重试
        await new Promise(resolve => setTimeout(resolve, this.POLLING_INTERVAL))
        retries++
      } catch (error) {
        console.error('Get task result error:', error)
        throw error
      }
    }

    throw new Error('Task result polling timeout')
  }

  // 处理图片生成任务
  async handleImageGeneration(params: TaskParams) {
    try {
      console.log('Starting image generation with params:', params)
      
      // 1. 上传原始图片到 RunningHub
      const imageName = await this.uploadImage(params.imageUrl)
      console.log('Image uploaded:', imageName)
      
      // 2. 创建任务
      const taskId = await this.createTask(imageName)
      console.log('Task created:', taskId)
      
      // 3. 等待并获取结果
      const outputUrl = await this.getTaskResult(taskId)
      console.log('Got result URL:', outputUrl)
      
      // 4. 上传结果到云存储（如果需要）
      const finalUrl = await uploadToCloud(outputUrl)
      
      return {
        code: 0,
        data: {
          imageUrl: finalUrl
        },
        msg: 'success'
      }
    } catch (error: any) {
      console.error('Image generation failed:', error)
      return {
        code: -1,
        msg: error.message || '处理失败'
      }
    }
  }
}

export default RunningHubService 