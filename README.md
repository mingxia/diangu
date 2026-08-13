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

## 架构约束

页面通过 `services/` 调用 `db/queries/`，公开查询只返回 `published` 数据。`search_text` 是派生字段；保存内容或关系后应重建。AI 和导入数据已有审计/暂存表，未来结果必须经人工审核，不能直接覆盖正式内容。
