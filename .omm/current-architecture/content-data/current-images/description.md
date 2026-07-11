管理员将文件发给 Next.js，服务端一次性读入内存，经 Sharp 转为 WebP，先删除旧文件再写临时文件并 rename，最后更新 Store.imagePath。
