import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

export interface RunningHubConfig {
  apiUrl: string
  apiKey: string
  workflowId: string
  timeouts: {
    operation: number
    upload: number
  }
  retries: {
    upload: number
  }
}

export const config: RunningHubConfig = {
  apiUrl: process.env.RUNNINGHUB_API_URL || 'https://www.runninghub.cn',
  apiKey: process.env.RUNNINGHUB_API_KEY || 'a8bc9682bcf1444b93f1a840cf16fc8e',
  workflowId: process.env.RUNNINGHUB_WORKFLOW_ID || '1872420507198091265',
  timeouts: {
    operation: 120000,
    upload: 60000
  },
  retries: {
    upload: 3
  }
} 