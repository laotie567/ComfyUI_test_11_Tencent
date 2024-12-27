import RunningHubService from '../services/comfyui.service'
import { config } from '../config'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

async function testImageGeneration() {
  try {
    const service = new RunningHubService(config)
    
    // 测试图片生成
    const result = await service.handleImageGeneration({
      userId: 'test-user',
      imageUrl: 'https://rh-images.xiaoyaoyou.com/60d4973d7f9c2f13144f0bf9c64598d6/output/tensorart_00183__fybyv.png'
    })

    console.log('Generation result:', result)
    
    if (result.code === 0 && result.data) {
      console.log('✅ Test passed: Image generation successful')
      console.log('Generated image URL:', result.data.imageUrl)
    } else {
      console.log('❌ Test failed:', result.msg)
    }
  } catch (error: any) {
    console.error('❌ Test error:', error.message)
  }
}

// 运行测试
testImageGeneration() 