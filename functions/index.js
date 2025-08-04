const { onObjectFinalized } = require('firebase-functions/v2/storage')
const { initializeApp } = require('firebase-admin/app')
const { getStorage } = require('firebase-admin/storage')
const { getFirestore, FieldPath } = require('firebase-admin/firestore')
const path = require('path') // 引入 Node.js 的 path 模块，用于处理文件路径

initializeApp()
const bucket = getStorage().bucket()
const firestore = getFirestore() // 在此处初始化 Firestore

// 定义优化图片的文件名后缀和目标格式
const OPTIMIZED_SUFFIX = '_800x800.webp'

// 定义优化图片所在的子目录名称
const OPTIMIZED_SUBDIRECTORY = 'optimizedImages'

/**
 * 辅助函数：从完整的文件路径中提取不带扩展名的文件名
 * 例如：'folder/image.jpg' => 'image'
 */
function getFileNameWithoutExtension(fullPath) {
  const fileNameWithExt = path.basename(fullPath) // 获取文件名带扩展名 'image.jpg'
  const fileNameParts = fileNameWithExt.split('.')
  if (fileNameParts.length > 1) {
    fileNameParts.pop() // 移除最后一个元素（扩展名）
  }
  return fileNameParts.join('.') // 重新拼接，得到不带扩展名的文件名
}

/**
 * Cloud Function：当优化后的图片上传到 Storage 时触发
 * 监听路径：cover/{userId}/optimizedImages/<fileName>
 */
exports.onOptimizedImageUploaded = onObjectFinalized(
  {
    bucket: bucket.name, // 监听默认 Bucket
    region: 'us-west1', // 确保与您的 Storage Bucket 区域一致
  },
  async (event) => {
    const object = event.data
    const filePath = object.name // 优化后图片的完整路径，例如 'cover/some_user_id/optimizedImages/image_800x800.webp'
    const contentType = object.contentType // 文件类型
    // 1. 检查是否是图片文件

    if (!contentType || !contentType.startsWith('image/')) {
      console.log('这不是一个图片文件，跳过。', filePath)
      return null
    } // 2. 检查路径是否符合优化图片的结构 (通过目录和文件名后缀判断)

    const pathParts = filePath.split('/') // 预期路径结构：'cover' / '{userId}' / 'optimizedImages' / '文件名_800x800.webp'
    if (
      pathParts.length < 4 ||
      pathParts[0] !== 'cover' ||
      pathParts[2] !== OPTIMIZED_SUBDIRECTORY ||
      !filePath.endsWith(OPTIMIZED_SUFFIX)
    ) {
      console.log('这不是一个优化后的图片，或路径结构不符合预期，跳过。', filePath)
      return null
    } // 3. 提取 userId (即上传者的ID)

    const userId = pathParts[1] // 位于路径的第二部分
    // **** 修改后的逻辑：从优化图片文件名中提取原始文件名基础部分 ****

    const optimizedFileNameWithSuffix = pathParts[pathParts.length - 1] // 获取 '文件名_800x800.webp'
    const originalFileNameBaseFromOptimized = getFileNameWithoutExtension(
      optimizedFileNameWithSuffix.substring(
        0,
        optimizedFileNameWithSuffix.length - OPTIMIZED_SUFFIX.length,
      ),
    )

    if (!originalFileNameBaseFromOptimized) {
      console.log('无法从优化文件名中提取原始文件名基础部分，跳过。', filePath)
      return null
    }
    console.log(`从优化图片提取到原始文件名基础部分: ${originalFileNameBaseFromOptimized}`) // **** 结束修改逻辑 ****
    // 4. 获取优化图片的下载 URL
    const file = bucket.file(filePath)
    let downloadUrl
    try {
      // 尝试获取签名的 URL，需要 iam.serviceAccounts.signBlob 权限
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // 设置一个足够长的过期时间
      })
      downloadUrl = signedUrl
      console.log(`获取到优化图片签名的 URL: ${downloadUrl}`)
    } catch (error) {
      // 如果权限不足或出现其他错误，尝试使用公共URL（如果文件是公共可读的）
      console.warn(`无法获取签名的 URL，尝试使用公共 URL。错误: ${error.message}`) // 假设您的优化图片是公开可读的
      downloadUrl = `https://storage.googleapis.com/${object.bucket}/${filePath}`
      console.log(`尝试使用优化图片公共 URL: ${downloadUrl}`)
    } // 5. 查询并更新 Firestore 文档

    const playlistsRef = firestore.collection('playlists')

    try {
      // 首先根据 userId 查询所有可能的文档
      const snapshot = await playlistsRef.where('userId', '==', userId).get()

      if (snapshot.empty) {
        console.log(`未找到 userId 为 ${userId} 的 playlists`)
        return null
      }

      const updatePromises = []
      let updatedCount = 0 // 遍历查询结果，进一步根据原始图片文件名进行匹配

      for (const doc of snapshot.docs) {
        const playlistData = doc.data()
        const playlistDocId = doc.id // 获取文档ID
        // 确保文档有 filePath 字段

        if (playlistData.filePath) {
          // 从 Firestore 文档的 filePath 中提取原始图片文件名基础部分
          const originalFileNameBaseFromFirestore = getFileNameWithoutExtension(
            playlistData.filePath,
          )

          console.log(
            `比较：来自优化图的 ${originalFileNameBaseFromOptimized} vs. 来自Firestore文档 ${playlistDocId} 的 ${originalFileNameBaseFromFirestore}`,
          ) // 如果两个文件名基础部分匹配，则更新此文档

          if (originalFileNameBaseFromOptimized === originalFileNameBaseFromFirestore) {
            console.log(`匹配成功！准备更新 playlist ${playlistDocId} 的 optimizedCoverUrl`)
            updatePromises.push(
              doc.ref.update({
                optimizedCoverUrl: downloadUrl,
              }),
            )
            updatedCount++ // 如果确定一个优化图片只对应一个播放列表，可以在这里 break;
            // 但为了健壮性，这里让它继续检查所有匹配的文档
          }
        } else {
          console.log(`playlist ${playlistDocId} 缺少 'filePath' 字段，跳过。`)
        }
      }

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises)
        console.log(`成功更新了 ${updatedCount} 个 playlists 的 optimizedCoverUrl`)
      } else {
        console.log(
          `未找到匹配的 playlist 文档进行更新 for userId ${userId} 和原始文件名 ${originalFileNameBaseFromOptimized}`,
        )
      }
    } catch (error) {
      console.error(`查询或更新 Firestore 文档失败 for userId ${userId}:`, error)
    }

    return null
  },
)

// 回填函数

const { onRequest } = require('firebase-functions/v2/https') // 引入 HTTP 触发器

// 定义原始图片所在的根目录名称 (根据您的 Storage 路径，应该是 'cover')
const ORIGINAL_IMAGE_ROOT_DIRECTORY = 'cover'

/**
 * Cloud Function：用于回填现有 playlists 文档中的 optimizedCoverUrl
 * 这是一个 HTTP 触发的函数，需要手动调用。
 */
exports.backfillOptimizedImageUrls = onRequest(
  {
    region: 'us-west1', // 确保与您的其他函数和 Storage Bucket 区域一致
    timeoutSeconds: 540, // 增加超时时间以处理大量数据，最大9分钟
    memory: '512Mi', // 根据需要增加内存
  },
  async (req, res) => {
    console.log('开始执行 backfillOptimizedImageUrls 回填任务...')

    const playlistsRef = firestore.collection('playlists')
    const BATCH_SIZE = 400 // Firestore 批处理限制为 500，我们用 400 比较安全

    try {
      let lastDoc = null
      let documentsProcessed = 0
      let documentsUpdated = 0
      let iteration = 0 // 循环处理，直到没有更多文档 (处理分页)

      while (true) {
        iteration++
        console.log(`--- 迭代 ${iteration}：获取下一批文档 ---`)
        let query = playlistsRef.orderBy(FieldPath.documentId()).limit(BATCH_SIZE)
        if (lastDoc) {
          query = query.startAfter(lastDoc)
        }

        const snapshot = await query.get()

        if (snapshot.empty) {
          console.log('没有更多文档了，回填完成。')
          break // 退出循环
        }

        const batch = firestore.batch()
        lastDoc = snapshot.docs[snapshot.docs.length - 1] // 记录最后一个文档，用于下一批的起始

        for (const doc of snapshot.docs) {
          documentsProcessed++
          const playlistData = doc.data()
          const playlistDocId = doc.id

          console.log(`处理文档: ${playlistDocId}`) // 修复: 检查 playlistData 是否存在，以及是否有 filePath 字段

          if (!playlistData || !playlistData.filePath) {
            console.log(`文档 ${playlistDocId} 缺少数据或 'filePath' 字段，跳过。`)
            continue // 跳过当前文档
          } // 从 Firestore 文档的 filePath 中提取 userId 和原始文件名基础部分

          const originalFullPath = playlistData.filePath // 例如 'cover/L2DYa98DF2feih2KrmoJXAlQKey1/Gemini_Generated_Image_w34azuw34azuw34a.jpg'
          const originalPathParts = originalFullPath.split('/')

          if (
            originalPathParts.length < 3 ||
            originalPathParts[0] !== ORIGINAL_IMAGE_ROOT_DIRECTORY
          ) {
            console.log(
              `文档 ${playlistDocId} 的 'filePath' 格式不符合预期: ${originalFullPath}，跳过。`,
            )
            continue
          }
          const docUserId = originalPathParts[1] // 从 Firestore 文档的 filePath 中提取 userId
          const originalFileNameBase = getFileNameWithoutExtension(originalFullPath) // 从 Firestore 文档的 filePath 中提取文件名基础部分
          // 构建预期中优化图片在 Storage 中的路径

          const expectedOptimizedImagePath = `${ORIGINAL_IMAGE_ROOT_DIRECTORY}/${docUserId}/${OPTIMIZED_SUBDIRECTORY}/${originalFileNameBase}${OPTIMIZED_SUFFIX}`

          console.log(`预期优化图片路径: ${expectedOptimizedImagePath}`)

          const optimizedFile = bucket.file(expectedOptimizedImagePath)

          try {
            // 检查优化图片是否存在
            const [exists] = await optimizedFile.exists()
            if (exists) {
              let downloadUrl
              try {
                // 尝试获取签名的 URL
                const [signedUrl] = await optimizedFile.getSignedUrl({
                  action: 'read',
                  expires: '03-09-2491',
                })
                downloadUrl = signedUrl
                console.log(`找到并获取签名的 URL for ${expectedOptimizedImagePath}`)
              } catch (urlError) {
                // 如果权限不足或错误，尝试使用公共URL
                console.warn(
                  `无法获取签名的 URL for ${expectedOptimizedImagePath}，尝试使用公共 URL。错误: ${urlError.message}`,
                )
                downloadUrl = `https://storage.googleapis.com/${bucket.name}/${expectedOptimizedImagePath}`
                console.log(`尝试使用公共 URL: ${downloadUrl}`)
              } // 只有当当前的 optimizedCoverUrl 不存在或与新的 URL 不同时才更新

              if (
                !playlistData.optimizedCoverUrl ||
                playlistData.optimizedCoverUrl !== downloadUrl
              ) {
                batch.update(doc.ref, { optimizedCoverUrl: downloadUrl })
                documentsUpdated++
                console.log(`添加到批处理更新: ${playlistDocId}`)
              } else {
                console.log(`optimizedCoverUrl 已是最新，无需更新: ${playlistDocId}`)
              }
            } else {
              console.log(
                `优化图片 ${expectedOptimizedImagePath} 不存在，跳过文档 ${playlistDocId}。`,
              )
            }
          } catch (fileCheckError) {
            console.error(
              `检查优化图片 ${expectedOptimizedImagePath} 失败 for ${playlistDocId}:`,
              fileCheckError,
            )
          }
        } // end for loop

        if (batch.isEmpty) {
          console.log(`批处理为空，跳过提交。`)
        } else {
          console.log(`提交批处理...`)
          await batch.commit()
          console.log(`批处理提交成功。`)
        }
      } // end while loop

      console.log(
        `回填任务完成。总处理文档: ${documentsProcessed}，总更新文档: ${documentsUpdated}`,
      )
      res
        .status(200)
        .send(`回填任务完成。总处理文档: ${documentsProcessed}，总更新文档: ${documentsUpdated}`)
    } catch (error) {
      console.error('回填任务执行失败:', error)
      res.status(500).send(`回填任务执行失败: ${error.message}`)
    }
  },
)
