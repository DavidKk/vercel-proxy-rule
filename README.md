[![Build Status](https://github.com/DavidKk/vercel-proxy-rule/actions/workflows/coverage.workflow.yml/badge.svg)](https://github.com/DavidKk/vercel-proxy-rule/actions/workflows/coverage.workflow.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Proxy Rule Management

Centralized management and generation of remote proxy rules, suitable for unified rule management across multiple clients.

- **Supported Clients**: Currently supports Clash only. Ensure your client supports `RULE-SET`.

## Deploy to Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDavidKk%2Fvercel-proxy-rule)

### Environment Variable Configuration

Refer to the [`.env.example`](./.env.example) file to set the required environment variables.

## Quick Start

1. Create a **GitHub Gist** and generate a **GitHub Access Token**.
2. Set the corresponding environment variables in Vercel.
3. Once deployed, you can manage proxy rules through the generated configuration.
