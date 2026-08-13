# 用典如神

“从想表达什么，到该用什么典故”的中文典故知识库与用典工具。第一轮实现结构化数据地基、关键词相关性搜索、三个公开页面和最小管理员编辑流程。

## 技术栈

Next.js 16 App Router、TypeScript、Tailwind CSS、OpenNext Cloudflare、Cloudflare Workers/D1、Drizzle ORM 与 Better Auth。D1 binding 固定为 `DB`。

## 本地开发

1. 安装依赖：`pnpm install`
2. 复制 `.env.example` 为 `.dev.vars`，生成至少 32 字符的 `BETTER_AUTH_SECRET`，配置 `ADMIN_EMAILS`。
3. 创建 D1：`pnpm wrangler d1 create diangu`，仅在本地 `wrangler.jsonc` 中替换占位数据库 ID。
4. 应用 migration：`pnpm db:migrate:local`
5. 导入演示数据：`pnpm db:seed:local`
6. 启动：`pnpm dev`

`.dev.vars`、账号 ID、生产数据库 ID 和 Secret 均不得提交。管理员账号不开放注册，应通过受控初始化流程创建，并且邮箱必须位于 `ADMIN_EMAILS`。

## Migration 与数据

修改 `src/db/schema/index.ts` 后运行 `pnpm db:generate`，审查并提交生成的 migration。正式环境只允许 migration：

```bash
pnpm db:migrate:local
pnpm db:migrate:remote
```

Seed 位于 `src/db/seed/seed.sql`，只用于本地和预览验证，不应覆盖生产内容。

## 检查、预览与部署

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
pnpm deploy
```

`preview` 通过 OpenNext 启动 production-like Worker；先应用本地 D1 migration/seed。部署前在 Cloudflare 控制台配置真实 D1 binding 与 Secrets，禁止提交这些值。

### Cloudflare Workers Builds 配置

从 Git 仓库连接 Cloudflare Workers Builds 时，仓库根目录下已经包含
`package.json`、`wrangler.jsonc` 和 `open-next.config.ts`，应使用以下配置：

| 项目 | 值 |
| --- | --- |
| 根目录 | `/`（仓库根目录） |
| 构建命令 | `npm run build` |
| 部署命令 | `npx wrangler deploy` |

构建命令会通过 OpenNext 生成 `.open-next/worker.js` 和静态资源，部署命令再按
`wrangler.jsonc` 发布生成物；不要把部署命令改成 `next deploy`，也不要跳过构建。

一次构建会先后显示 `OpenNext — Building Next.js app`、
`$ opennextjs-cloudflare build` 和 `OpenNext — Cloudflare build`。如果这一整组（包括
带 `$` 的命令行）在**同一次部署日志**中从头反复出现，那不是正常的阶段标题，而是构建
进程或平台在重新启动。项目的 `build` 脚本只直接调用一次 OpenNext，不包含递归调用；
此时需要保留相邻两组之间的日志，那里的退出码、超时、内存不足或平台重试提示才是
重新启动的原因。仅截取每组开头无法判断触发原因。

还要先确认 Cloudflare 页面展示的是同一个部署尝试，而不是多个失败部署的日志被依次
打开；可用部署 ID 和每组时间戳区分。若确属同一次尝试，下载完整日志并从第二组
`OpenNext — Building Next.js app` 向上查找第一个异常。不要把构建命令改为
`npm run deploy`：该脚本本身会再次执行构建，在 Workers Builds 中仍应保持上表中的
`npm run build` 与 `npx wrangler deploy` 分工。

如果日志显示 `WARN worker compatibility date`，应同步更新 `wrangler.jsonc` 中的
`compatibility_date`。它是警告而不是导致构建重启的错误；本仓库已将该日期更新到
`2026-08-13`。排查真正的部署失败时，请从日志末尾向上查找第一个 `ERROR`、`Failed`
或非零退出码，而不是把 OpenNext 的阶段标题当作错误。

“构建变量”可以为空，因为当前构建本身不依赖环境变量。不过，应用运行时仍必须在
Cloudflare Worker 的 **Settings > Variables and Secrets** 中配置：

- `BETTER_AUTH_SECRET`：Secret，至少 32 个字符；
- `BETTER_AUTH_URL`：Variable，生产站点的完整 HTTPS 地址；
- `ADMIN_EMAILS`：Variable，允许进入后台的邮箱，多个值使用英文逗号分隔。

这些是 Worker 的运行时变量，并不等同于 Workers Builds 页面中的构建变量。D1 的
`DB` binding 已在 `wrangler.jsonc` 声明；首次部署前还需确认对应数据库存在，并运行
`npm run db:migrate:remote` 应用正式环境 migration。

## 架构约束

页面通过 `services/` 调用 `db/queries/`，公开查询只返回 `published` 数据。`search_text` 是派生字段；保存内容或关系后应重建。AI 和导入数据已有审计/暂存表，未来结果必须经人工审核，不能直接覆盖正式内容。
