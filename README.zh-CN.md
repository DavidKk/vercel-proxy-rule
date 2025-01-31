[![Build Status](https://github.com/DavidKk/vercel-proxy-rule/actions/workflows/coverage.workflow.yml/badge.svg)](https://github.com/DavidKk/vercel-proxy-rule/actions/workflows/coverage.workflow.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# 代理规则管理

集中管理并生成远程代理规则，适用于多客户端统一规则管理。

- **支持客户端**：目前仅支持 Clash，请确保客户端支持 `RULE-SET`
- **支持规则**：支持 gfwlist 规则（会自动合并到代理规则中，无法单独管理）

## 部署到 Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDavidKk%2Fvercel-proxy-rule)

### 环境变量配置

参考 [`.env.example`](./.env.example) 文件，设置必要的环境变量。

## 快速开始

1. 创建一个 **GitHub Gist** 并生成一个 **GitHub Access Token**。
2. 在 Vercel 中设置相应的环境变量。
3. 部署完成后，您可以通过生成的规则管理代理。
