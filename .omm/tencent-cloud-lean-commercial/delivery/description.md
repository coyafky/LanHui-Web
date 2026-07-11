# GitHub Actions + 镜像仓库

流水线执行质量门、构建 web 与 migrate 镜像并按 Git SHA 标记。CVM 只拉取已验证镜像，不在服务器现场 npm install 或 next build。