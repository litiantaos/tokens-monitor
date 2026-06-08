#!/bin/bash
SERVER="user@your-server"
REMOTE_DIR="/opt/tokens-monitor"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> 同步代码..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.nuxt' \
  --exclude='.output' \
  --exclude='.git' \
  --exclude='deploy.sh' \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> 安装依赖并构建..."
ssh "$SERVER" "cd $REMOTE_DIR && npm install && npm run build"

echo "==> 重启服务..."
ssh "$SERVER" "systemctl restart tokens-monitor"

echo "==> 部署完成!"
