# API Keys Setup

MeetingMind Pro uses your own API key for AI processing. This gives you full control over costs and usage.

## Supported Providers

| Provider | Get API Key | Pricing |
|----------|-------------|---------|
| **Claude (Recommended)** | [console.anthropic.com](https://console.anthropic.com/) | ~$0.003 per 1K tokens |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | ~$0.005 per 1K tokens |

## Getting an API Key

### Claude (Anthropic)

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

### OpenAI

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **Create new secret key**
4. Copy the key (starts with `sk-`)

## Configure in MeetingMind

1. Open **Settings → MeetingMind → AI Enrichment**
2. Select your **AI Provider** (Claude or OpenAI)
3. Paste your API key
4. Click **Test Connection** to verify

## Cost Estimates

| Meeting Length | Approximate Cost |
|----------------|------------------|
| 15 minutes | $0.01 - $0.02 |
| 30 minutes | $0.02 - $0.04 |
| 60 minutes | $0.04 - $0.08 |

::: tip
Costs vary based on how much people talk. These are rough estimates for typical meetings.
:::

## Security

- Your API key is stored locally in Obsidian's plugin data
- Keys are never sent to MeetingMind servers
- API calls go directly to Claude/OpenAI

## Troubleshooting

### "401 Unauthorized"
- Double-check your API key is correct
- Ensure your API account has credits/payment method

### "404 Not Found"
- Your API key may not have access to the required model
- Check your account tier supports the model

### "Rate Limited"
- You've hit API rate limits
- Wait a few minutes and try again
- Consider upgrading your API tier

## Tips

- **Set usage limits** in your API provider dashboard to control costs
- **Start with Claude** — it provides the best quality for meeting summaries
- **Monitor usage** in your provider's dashboard

