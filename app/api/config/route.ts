import { NextResponse } from "next/server";

import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

// Danger! Do not hard code any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
  hideUserApiKey: serverConfig.hideUserApiKey,
  disableGPT4: serverConfig.disableGPT4,
  hideBalanceQuery: serverConfig.hideBalanceQuery,
  disableFastLink: serverConfig.disableFastLink,
  customModels: serverConfig.customModels,
  defaultModel: serverConfig.defaultModel,
  visionModels: serverConfig.visionModels,
  serverAzureConfigured: serverConfig.serverAzureConfigured,
  serverGoogleConfigured: serverConfig.serverGoogleConfigured,
  serverAnthropicConfigured: serverConfig.serverAnthropicConfigured,
  serverBaiduConfigured: serverConfig.serverBaiduConfigured,
  serverBytedanceConfigured: serverConfig.serverBytedanceConfigured,
  serverAlibabaConfigured: serverConfig.serverAlibabaConfigured,
  serverTencentConfigured: serverConfig.serverTencentConfigured,
  serverMoonshotConfigured: serverConfig.serverMoonshotConfigured,
  serverIflytekConfigured: serverConfig.serverIflytekConfigured,
  serverDeepSeekConfigured: serverConfig.serverDeepSeekConfigured,
  serverXAIConfigured: serverConfig.serverXAIConfigured,
  serverChatGLMConfigured: serverConfig.serverChatGLMConfigured,
  serverSiliconFlowConfigured: serverConfig.serverSiliconFlowConfigured,
  serverStabilityConfigured: serverConfig.serverStabilityConfigured,
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

async function handle() {
  return NextResponse.json(DANGER_CONFIG);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
