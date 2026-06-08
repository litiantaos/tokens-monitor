# Tokens Monitor

智谱 GLM Coding Plan 多账号用量监控面板。

实时查看多个账号的配额使用情况、重置倒计时、MCP 调用量和 7 天用量趋势。

## 功能

- **多账号管理** — 添加、编辑、删除多个 API Key，支持在线测试 Key 有效性
- **配额监控** — 5 小时 / 周期限额百分比 + 重置倒计时
- **MCP 用量** — 联网搜索、网页读取、开源仓库等 MCP 工具的月度调用量
- **用量趋势** — 近 7 天的小时级 Token 用量 Sparkline 图表
- **自动刷新** — 每 5 分钟自动拉取最新数据，倒计时实时更新
- **等级标识** — 自动识别 MAX / PRO / LITE 等级并显示对应 Badge

## 技术栈

- [Nuxt 4](https://nuxt.com) (Vue 3 + Nitro)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Remix Icon](https://remixicon.com)
- TypeScript

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/<your-username>/tokens-monitor.git
cd tokens-monitor

# 安装依赖
npm install

# 配置账号（参考示例文件）
cp accounts.example.json accounts.json
# 编辑 accounts.json，填入你的 API Key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可看到监控面板。

## 账号配置

`accounts.json` 格式：

```json
[
  {
    "name": "account-1",
    "token": "your-api-key-here"
  },
  {
    "name": "account-2",
    "token": "another-api-key"
  }
]
```

也可以在设置页面（`/settings`）中通过界面管理账号。

## 部署

参考 `deploy.example.sh`，通过 rsync 同步代码到服务器后构建即可。

建议使用 systemd 管理进程，示例服务文件：

```ini
[Unit]
Description=Tokens Monitor
After=network.target

[Service]
WorkingDirectory=/opt/tokens-monitor
ExecStart=/usr/bin/node .output/server/index.mjs
Environment=PORT=3210
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 项目结构

```
pages/
  index.vue            监控主页
  settings.vue         账号管理页
components/
  QuotaBar.vue         配额进度条
  SparkLine.vue        趋势折线图
  AppButton.vue        通用按钮
  AccountForm.vue      账号表单
server/
  api/
    quota.get.ts       配额数据接口
    usage.get.ts       用量数据接口
    accounts/          账号 CRUD + 测试接口
  utils/
    quota.ts           API 请求、缓存、账号读写
types/
  quota.ts             类型定义与常量
layouts/
  default.vue          默认布局
assets/css/
  main.css             全局样式
```

## License

[MIT](./LICENSE)
