### NVIDIA NIM to OpenAI Proxy
Hello, this is my first ever project on Github that I am making public. This is essentially just a translation layer between the API format that NVIDIA NIM uses to the format OpenAI uses. I made this originally by building on a script from a Reddit guide. Over the time of a month I've iterated on it, fixed problems, added auth, more models, and removed/replaced deprecated models.
These are the current available models for usage, and the use cases for all of them. (Note: The Google models are mostly for troubleshooting issues with latency and timeouts.)

### Requirements

Node.js 18+, a NVAPI/Nim API key, a deployment platform (though if you follow the guide below none of those should be a problem).

### Model Mapping

| Alias | Backend Model | Best For | Speed | Filters |
|---|---|---|---|---|
| `gpt-4-turbo` | `moonshotai/kimi-k2.6` | Deep, immersive RP | Medium | Medium-High |
| `gpt-4o` | `deepseek-ai/deepseek-v4-pro` | Complex plots, reasoning | Medium | High |
| `gpt-4` | `qwen/qwen3-coder-480b-a35b-instruct` | Tech/cyberpunk personas | Slow | Medium |
| `gpt-4-flash` | `deepseek-ai/deepseek-v4-flash` | Fast, non-edgy RP | Fast | High |
| `gemini-pro` | `nvidia/llama-3.3-nemotron-super-49b-v1.5` | Daily driver, low latency | Fast | Low |
| `mistral` | `mistralai/mistral-large-3-675b-instruct-2512` | Best quality, unfiltered | Very Slow | Low |
| `mistral-turbo` | `mistralai/mistral-medium-3.5-128b` | Fast fallback | Fast | Low |
| `mistral-pro` | `mistralai/mistral-small-4-119b-2603` | Lightweight scenes | Very Fast | Low |
| `mistral-nemo` | `mistralai/mistral-nemotron` | Casual/anime RP | Fast | Low |
| `claude-3-opus` | `openai/gpt-oss-120b` | Alternative to Chinese models | Medium | Low-Medium |
| `claude-3-sonnet` | `openai/gpt-oss-20b` | Fast, distinct voice | Fast | Low-Medium |
| `glm-5.1` | `z-ai/glm-5.1` | General purpose | Medium | Medium |
| `gpt-3.5-turbo` | `nvidia/nemotron-3-super-120b-a12b` | Lightweight tasks | Fast | Low |
| `gpt-3.5` | `qwen/qwen3.5-397b-a17b` | Qwen fallback | Medium | Medium |
| `google-light` | `google/gemma-4-31b-it` | Short scenes, fast | Fast | Low-Medium |
| `google-lighter` | `google/gemma-3n-e4b-it` | Mostly testing only | Very Fast | Low-Medium |
| `google-lightest` | `google/gemma-2-2b-it` | Testing only | Extremely fast | Low |
| `m2.7` | `minimaxai/minimax-m2.7` | Experimental | Medium | Unknown (to me) |
| `step-3.5-flash` | `stepfun-ai/step-3.5-flash` | Chinese creative model | Fast | Medium |

### Filter Guide

| If your RP involves... | Avoid | Use instead |
|---|---|---|
| Dark themes, violence, mature content | `gpt-4o`, `gpt-4-flash`, `gpt-4-turbo` (They have high filters due to being based in China) | `mistral`, `gemini-pro`, `claude-3-opus` |
| Fast responses needed | `mistral` (675B) | `gemini-pro`, `mistral-turbo` |
| Long context / memory | Anything under 30B | `gpt-4-turbo`, `mistral`, `gpt-4` |
| Technical/coding personas | Anything except `gpt-4` | `gpt-4` (Qwen Coder) |

### Fallback Chain

If your requested model fails, the proxy automatically tries:
1. Requested model
2. `mistralai/mistral-medium-3.5-128b`
3. `mistralai/mistral-small-4-119b-2603`
4. `nvidia/llama-3.3-nemotron-super-49b-v1.5`
5. `google/gemma-4-31b-it`

All fallbacks are non-Chinese-hosted to avoid filter interruption mid-scene. These can be changed, but i found that these four work best as fallbacks.

### Auth Guide
I added auth middleware that wasn't present in the code I built upon. It uses an env var in your deployment. Use any secure string of 32+ characters, or generate one by hashing your NVAPI key. I recommend using an online hash tool or command to make a hash of your NVAPI key since the key is already complex as is, and a hash makes it more secure as it cannot be realistically reversed back to the NVAPI key. The first 32 characters of the hash are enough.
You can easily generate the hash with an online SHA-256 generator or any hash tool. Then make an env variable called "CLIENT_AUTH_KEY" and enter the first 32 characters of your hash into the variable (or any custom length over 16, or a custom key). Enter the hash into the API Key field in JanitorAI/SillyTavern.

### Proxy Setup Guide

Firstly head to https://build.nvidia.com/ and login/create an account. Then click your profile icon and navigate to "API keys". There you can generate an API key, and label it whatever you want. Save it immediately — you'll need to regenerate it if lost.

You *can* use basically any service that allows cloud deployments/VMs with a static IP, but I recommend Railway, Render, and Vercel. Possibly Oracle if you are comfortable with SSH and value the freedom it gives, but Railway is the easiest to setup.
You need to login to Railway with your Github. **Fork the repo before deploying. I cannot see your env vars, but forking ensures your deployment is fully isolated!** This prevents me (or anyone) from seeing your deployment in Railway's dashboard or through github. I also recommend making either your own repo private, or making sure deployments aren't visible on the frontpage. Making your repo private is the surest way to protect your deployment details.
After you have made a deployment, you need to wait around 3 minutes for it to finish deploying. Then go into the "variables" tab, and create an env var with the name "NIM_API_KEY", and enter your NVAPI key into the variable. Next in your deployment go to the settings page, and there the networking section. Generate a public URL for your deployment. This is necessary to access it. Now your proxy is ready.

### Important Information
You can check the status of your proxy with the "/health" endpoint, and a list of models with "/v1/models". These endpoints intentionally do not require the auth, so clients can verify connectivity before configuring auth.
Your actual chat endpoint is in "/v1/chat/completions", and is the one you use in Janitor AI/SillyTavern or whatever platform you use.
The client never sees your NVAPI key, which is why we don't use it as the auth, since the whole point of the auth configuration is so that your NVAPI key is not stored on your client.

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| "All models failed" error | NIM API key invalid or expired | Regenerate key at build.nvidia.com |
| Very slow responses | Using `mistral` (675B) or Chinese models during peak hours | Switch to `gemini-pro` or `mistral-turbo` |
| Filter interrupts RP | Using Chinese-hosted model for mature content | Use `mistral`, `gemini-pro`, or `claude-3-opus` |
| 404 on `/v1/chat/completions` | Auth mismatch | Verify `CLIENT_AUTH_KEY` matches between Railway and client |
