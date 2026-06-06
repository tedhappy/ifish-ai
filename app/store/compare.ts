import { nanoid } from "nanoid";
import { getClientApi } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { ServiceProvider, StoreKey } from "../constant";
import Locale from "../locales";
import { showToast } from "../components/ui-lib";
import { logger } from "../utils/logger";
import { createPersistStore } from "../utils/store";
import { useAccessStore } from "./access";
import { useAppConfig, DEFAULT_CONFIG } from "./config";
import {
  ChatSession,
  CompareColumnResult,
  createMessage,
  useChatStore,
} from "./chat";

export type ComparePlatform = {
  providerName: ServiceProvider;
  displayName: string;
  defaultModel: string;
  enabled?: boolean;
};

export function isComparePlatformEnabled(providerName: ServiceProvider) {
  const platform = COMPARE_PLATFORMS.find(
    (item) => item.providerName === providerName,
  );
  return platform?.enabled !== false;
}

function getEnabledPlatforms() {
  return COMPARE_PLATFORMS.filter((platform) => platform.enabled !== false);
}

export type CompareHistoryItem = {
  id: string;
  sessionId: string;
  messageId: string;
  prompt: string;
  createdAt: number;
  columns: CompareColumnResult[];
};

export const COMPARE_PLATFORMS: ComparePlatform[] = [
  {
    providerName: ServiceProvider.DeepSeek,
    displayName: "DeepSeek",
    defaultModel: "", // 实际从配置读取
  },
  {
    providerName: ServiceProvider.ByteDance,
    displayName: "豆包",
    defaultModel: "", // 实际从配置读取
  },
  {
    providerName: ServiceProvider.Alibaba,
    displayName: "通义千问",
    defaultModel: "", // 实际从配置读取
  },
  {
    providerName: ServiceProvider.Baidu,
    displayName: "文心一言",
    defaultModel: "", // 实际从配置读取
    enabled: false,
  },
  {
    providerName: ServiceProvider.Tencent,
    displayName: "混元",
    defaultModel: "", // 实际从配置读取
    enabled: false,
  },
  {
    providerName: ServiceProvider.Moonshot,
    displayName: "Kimi",
    defaultModel: "", // 实际从配置读取
    enabled: false,
  },
  {
    providerName: ServiceProvider.ChatGLM,
    displayName: "智谱AI",
    defaultModel: "", // 实际从配置读取
    enabled: false,
  },
];

export const DEFAULT_COMPARE_PROVIDERS: ServiceProvider[] = [
  ServiceProvider.DeepSeek,
  ServiceProvider.ByteDance,
  ServiceProvider.Alibaba,
];

function getCompareLimits() {
  const compareConfig = useAppConfig.getState().compareConfig;
  const totalPlatforms = getEnabledPlatforms().length;
  const minModels = Math.max(
    2,
    Math.min(totalPlatforms, Math.floor(compareConfig?.minModels ?? 2)),
  );
  const maxModels = Math.max(
    minModels,
    Math.min(totalPlatforms, Math.floor(compareConfig?.maxModels ?? 4)),
  );

  return { minModels, maxModels };
}

function getFallbackProviders() {
  return Array.from(
    new Set([
      ...DEFAULT_COMPARE_PROVIDERS,
      ...getEnabledPlatforms().map((platform) => platform.providerName),
    ]),
  );
}

function normalizeSelectedProviders(
  providers: ServiceProvider[],
): ServiceProvider[] {
  const { minModels, maxModels } = getCompareLimits();
  const selectedProviders = providers.filter(
    (providerName, index) =>
      !!getPlatformByProvider(providerName) &&
      providers.indexOf(providerName) === index,
  );
  const normalizedProviders = selectedProviders.slice(0, maxModels);

  for (const providerName of getFallbackProviders()) {
    if (normalizedProviders.length >= minModels) break;
    if (!normalizedProviders.includes(providerName)) {
      normalizedProviders.push(providerName);
    }
  }

  return normalizedProviders.slice(0, maxModels);
}

function getPlatformDefaultModel(providerName: ServiceProvider): string {
  const compareConfig = useAppConfig.getState().compareConfig;
  const defaultConfig = DEFAULT_CONFIG.compareConfig;

  switch (providerName) {
    case ServiceProvider.DeepSeek:
      return (
        compareConfig.defaultDeepSeekModel || defaultConfig.defaultDeepSeekModel
      );
    case ServiceProvider.ByteDance:
      return (
        compareConfig.defaultByteDanceModel ||
        defaultConfig.defaultByteDanceModel
      );
    case ServiceProvider.Alibaba:
      return (
        compareConfig.defaultAlibabaModel || defaultConfig.defaultAlibabaModel
      );
    case ServiceProvider.Baidu:
      return compareConfig.defaultBaiduModel || defaultConfig.defaultBaiduModel;
    case ServiceProvider.Tencent:
      return (
        compareConfig.defaultTencentModel || defaultConfig.defaultTencentModel
      );
    case ServiceProvider.Moonshot:
      return (
        compareConfig.defaultMoonshotModel || defaultConfig.defaultMoonshotModel
      );
    case ServiceProvider.ChatGLM:
      return (
        compareConfig.defaultChatGLMModel || defaultConfig.defaultChatGLMModel
      );
    default:
      return "";
  }
}

function getPlatformByProvider(providerName: ServiceProvider) {
  const platform = COMPARE_PLATFORMS.find(
    (p) => p.providerName === providerName,
  );

  if (platform && platform.enabled !== false) {
    // 使用配置的默认模型
    return {
      ...platform,
      defaultModel: getPlatformDefaultModel(providerName),
    };
  }

  return platform;
}

function resolveSelectedPlatforms(
  providers: ServiceProvider[],
): CompareColumnResult[] {
  return providers
    .map((providerName) => getPlatformByProvider(providerName))
    .filter((platform): platform is ComparePlatform => !!platform)
    .map((platform) => ({
      id: nanoid(),
      model: platform.defaultModel,
      providerName: platform.providerName,
      displayName: platform.displayName,
      status: "loading" as const,
      content: "",
    }));
}

const PROVIDER_DEFAULT_PARAMS: Record<
  string,
  {
    temperature: number;
    top_p: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  }
> = {
  [ServiceProvider.DeepSeek]: {
    temperature: 1,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  [ServiceProvider.ByteDance]: {
    temperature: 0.7,
    top_p: 0.9,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  [ServiceProvider.Alibaba]: {
    temperature: 0.7,
    top_p: 0.8,
  },
  [ServiceProvider.Baidu]: {
    temperature: 0.7,
    top_p: 0.8,
  },
  [ServiceProvider.Tencent]: {
    temperature: 0.7,
    top_p: 0.9,
  },
  [ServiceProvider.Moonshot]: {
    temperature: 0.7,
    top_p: 0.9,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  [ServiceProvider.ChatGLM]: {
    temperature: 0.7,
    top_p: 0.9,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
};

function isProviderConfigured(providerName: ServiceProvider): boolean {
  const access = useAccessStore.getState();
  access.fetch();

  switch (providerName) {
    case ServiceProvider.DeepSeek:
      return access.isValidDeepSeek();
    case ServiceProvider.ByteDance:
      return access.isValidByteDance();
    case ServiceProvider.Alibaba:
      return access.isValidAlibaba();
    case ServiceProvider.Google:
      return access.isValidGoogle();
    case ServiceProvider.Anthropic:
      return access.isValidAnthropic();
    case ServiceProvider.Baidu:
      return access.isValidBaidu();
    case ServiceProvider.Tencent:
      return access.isValidTencent();
    case ServiceProvider.Moonshot:
      return access.isValidMoonshot();
    case ServiceProvider.Iflytek:
      return access.isValidIflytek();
    case ServiceProvider.XAI:
      return access.isValidXAI();
    case ServiceProvider.ChatGLM:
      return access.isValidChatGLM();
    case ServiceProvider.SiliconFlow:
      return access.isValidSiliconFlow();
    case ServiceProvider.Azure:
      return access.isValidAzure();
    default:
      return false;
  }
}

function getCompareConfig(model: string, providerName: ServiceProvider) {
  const defaults = PROVIDER_DEFAULT_PARAMS[providerName] ?? {
    temperature: 0.7,
    top_p: 0.9,
  };
  return {
    model,
    providerName,
    stream: true,
    ...defaults,
  };
}

function allColumnsFinished(columns: CompareColumnResult[]) {
  return columns.every(
    (column) => column.status === "done" || column.status === "error",
  );
}

function syncCompareMessage(
  session: ChatSession,
  messageId: string,
  columns: CompareColumnResult[],
) {
  useChatStore.getState().updateTargetSession(session, (targetSession) => {
    const message = targetSession.messages.find(
      (item) => item.id === messageId,
    );
    if (!message?.compareResults) return;
    message.compareResults = columns.map((column) => ({ ...column }));
    if (allColumnsFinished(columns)) {
      message.streaming = false;
    }
  });
}

const DEFAULT_COMPARE_STATE = {
  compareModeEnabled: false,
  selectedProviders: normalizeSelectedProviders(DEFAULT_COMPARE_PROVIDERS),
  compareHistory: [] as CompareHistoryItem[],
  platformSelectorCollapsed: false,
  historySearchQuery: "",
  historyFilterProvider: null as ServiceProvider | null,
  expandedHistoryItems: [] as string[],
};

export const useCompareStore = createPersistStore(
  DEFAULT_COMPARE_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      toggleCompareMode() {
        set((state) => {
          const nextEnabled = !state.compareModeEnabled;
          return {
            compareModeEnabled: nextEnabled,
            selectedProviders: normalizeSelectedProviders(
              state.selectedProviders,
            ),
            platformSelectorCollapsed: nextEnabled
              ? false
              : state.platformSelectorCollapsed,
          };
        });
      },

      setHistorySearchQuery(query: string) {
        set({ historySearchQuery: query });
      },

      setHistoryFilterProvider(provider: ServiceProvider | null) {
        set({ historyFilterProvider: provider });
      },

      toggleHistoryItemExpanded(id: string) {
        set((state) => {
          const isExpanded = state.expandedHistoryItems.includes(id);
          if (isExpanded) {
            return {
              expandedHistoryItems: state.expandedHistoryItems.filter(
                (itemId) => itemId !== id,
              ),
            };
          } else {
            return {
              expandedHistoryItems: [...state.expandedHistoryItems, id],
            };
          }
        });
      },

      expandAllHistory() {
        set((state) => ({
          expandedHistoryItems: state.compareHistory.map((item) => item.id),
        }));
      },

      collapseAllHistory() {
        set({ expandedHistoryItems: [] });
      },

      getFilteredHistory() {
        const state = _get();
        let filtered = state.compareHistory;

        if (state.historySearchQuery.trim()) {
          const query = state.historySearchQuery.toLowerCase().trim();
          filtered = filtered.filter(
            (item) =>
              item.prompt.toLowerCase().includes(query) ||
              item.columns.some(
                (col) =>
                  col.displayName.toLowerCase().includes(query) ||
                  col.content.toLowerCase().includes(query),
              ),
          );
        }

        if (state.historyFilterProvider) {
          filtered = filtered.filter((item) =>
            item.columns.some(
              (col) => col.providerName === state.historyFilterProvider,
            ),
          );
        }

        return filtered;
      },

      setCompareModeEnabled(enabled: boolean) {
        set((state) => ({
          compareModeEnabled: enabled,
          selectedProviders: normalizeSelectedProviders(
            state.selectedProviders,
          ),
          platformSelectorCollapsed: enabled
            ? false
            : state.platformSelectorCollapsed,
        }));
      },

      setPlatformSelectorCollapsed(collapsed: boolean) {
        set({ platformSelectorCollapsed: collapsed });
      },

      setSelectedProviders(providers: ServiceProvider[]) {
        const { minModels, maxModels } = getCompareLimits();
        if (providers.length < minModels) {
          showToast(Locale.Compare.TooFewModels(minModels));
          return;
        }
        if (providers.length > maxModels) {
          showToast(Locale.Compare.TooManyModels(maxModels));
          return;
        }
        set({ selectedProviders: normalizeSelectedProviders(providers) });
      },

      togglePlatform(providerName: ServiceProvider) {
        if (!isComparePlatformEnabled(providerName)) {
          return;
        }

        const { minModels, maxModels } = getCompareLimits();
        const current = get().selectedProviders;
        const exists = current.includes(providerName);

        if (exists) {
          if (current.length <= minModels) {
            showToast(Locale.Compare.TooFewModels(minModels));
            return;
          }
          get().setSelectedProviders(
            current.filter((item) => item !== providerName),
          );
          return;
        }

        if (current.length >= maxModels) {
          showToast(Locale.Compare.TooManyModels(maxModels));
          return;
        }

        get().setSelectedProviders([...current, providerName]);
      },

      clearHistory() {
        set({ compareHistory: [] });
      },

      removeHistoryItem(id: string) {
        set((state) => ({
          compareHistory: state.compareHistory.filter((item) => item.id !== id),
        }));
      },

      async submitCompare(content: string, session: ChatSession) {
        const trimmed = content.trim();
        if (!trimmed) return;

        const selectedProviders = normalizeSelectedProviders(
          get().selectedProviders,
        );
        set({ selectedProviders });
        const unavailable = selectedProviders.filter(
          (providerName) => !isProviderConfigured(providerName),
        );

        if (unavailable.length > 0) {
          showToast(
            Locale.Compare.MissingApiKey(
              unavailable
                .map(
                  (providerName) =>
                    getPlatformByProvider(providerName)?.displayName ??
                    providerName,
                )
                .join("、"),
            ),
          );
          return;
        }

        const columns = resolveSelectedPlatforms(selectedProviders);

        const userMessage = createMessage({
          role: "user",
          content: trimmed,
        });

        const compareMessage = createMessage({
          role: "assistant",
          streaming: true,
          isCompareMessage: true,
          model: "compare" as any,
          compareResults: columns,
        });

        const historyItem: CompareHistoryItem = {
          id: nanoid(),
          sessionId: session.id,
          messageId: compareMessage.id!,
          prompt: trimmed,
          createdAt: Date.now(),
          columns: columns.map((column) => ({ ...column })),
        };

        useChatStore
          .getState()
          .updateTargetSession(session, (targetSession) => {
            targetSession.messages = targetSession.messages.concat([
              userMessage,
              compareMessage,
            ]);
            targetSession.lastUpdate = Date.now();
          });

        set((state) => ({
          compareHistory: [historyItem, ...state.compareHistory].slice(0, 200),
          platformSelectorCollapsed: true,
        }));

        await Promise.allSettled(
          columns.map((column) =>
            get().runColumn({
              session,
              messageId: compareMessage.id!,
              historyId: historyItem.id,
              column,
              prompt: trimmed,
            }),
          ),
        );
      },

      async runColumn(options: {
        session: ChatSession;
        messageId: string;
        historyId: string;
        column: CompareColumnResult;
        prompt: string;
      }) {
        const { session, messageId, historyId, column, prompt } = options;
        const startTime = Date.now();
        const api = getClientApi(column.providerName);

        column.status = "streaming";
        column.content = "";
        column.error = undefined;

        const liveSession = useChatStore
          .getState()
          .sessions.find((item) => item.id === session.id);
        const message = liveSession?.messages.find(
          (item) => item.id === messageId,
        );
        if (message?.compareResults) {
          syncCompareMessage(session, messageId, message.compareResults);
        }

        return new Promise<void>((resolve) => {
          api.llm
            .chat({
              messages: [{ role: "user", content: prompt }],
              config: getCompareConfig(column.model, column.providerName),
              useStandaloneConfig: true,
              onController: (controller) => {
                ChatControllerPool.addController(
                  session.id,
                  `${messageId}-${column.id}`,
                  controller,
                );
              },
              onUpdate: (content) => {
                const liveSession = useChatStore
                  .getState()
                  .sessions.find((item) => item.id === session.id);
                const liveMessage = liveSession?.messages.find(
                  (item) => item.id === messageId,
                );
                const liveColumn = liveMessage?.compareResults?.find(
                  (item) => item.id === column.id,
                );
                if (!liveColumn || !liveMessage?.compareResults) return;

                liveColumn.content = content;
                liveColumn.status = "streaming";
                syncCompareMessage(
                  session,
                  messageId,
                  liveMessage.compareResults,
                );

                set((state) => ({
                  compareHistory: state.compareHistory.map((item) =>
                    item.id === historyId
                      ? {
                          ...item,
                          columns: liveMessage.compareResults!.map((c) => ({
                            ...c,
                          })),
                        }
                      : item,
                  ),
                }));
              },
              onFinish: (content) => {
                const liveSession = useChatStore
                  .getState()
                  .sessions.find((item) => item.id === session.id);
                const liveMessage = liveSession?.messages.find(
                  (item) => item.id === messageId,
                );
                const liveColumn = liveMessage?.compareResults?.find(
                  (item) => item.id === column.id,
                );
                if (!liveColumn || !liveMessage?.compareResults) {
                  resolve();
                  return;
                }

                liveColumn.content = content;
                liveColumn.status = "done";
                liveColumn.latencyMs = Date.now() - startTime;
                syncCompareMessage(
                  session,
                  messageId,
                  liveMessage.compareResults,
                );

                set((state) => ({
                  compareHistory: state.compareHistory.map((item) =>
                    item.id === historyId
                      ? {
                          ...item,
                          columns: liveMessage.compareResults!.map((c) => ({
                            ...c,
                          })),
                        }
                      : item,
                  ),
                }));

                ChatControllerPool.remove(
                  session.id,
                  `${messageId}-${column.id}`,
                );
                resolve();
              },
              onError: (error) => {
                const liveSession = useChatStore
                  .getState()
                  .sessions.find((item) => item.id === session.id);
                const liveMessage = liveSession?.messages.find(
                  (item) => item.id === messageId,
                );
                const liveColumn = liveMessage?.compareResults?.find(
                  (item) => item.id === column.id,
                );
                if (!liveColumn || !liveMessage?.compareResults) {
                  resolve();
                  return;
                }

                // 提供更友好的错误信息
                let friendlyErrorMessage = error.message;

                if (
                  error.message.includes("Insufficient Balance") ||
                  error.message.includes("余额不足")
                ) {
                  friendlyErrorMessage = "API 账户余额不足，请检查账户充值";
                } else if (
                  error.message.includes("AccessDenied") ||
                  error.message.includes("拒绝访问")
                ) {
                  friendlyErrorMessage = "API 密钥无效或权限不足，请检查配置";
                } else if (
                  error.message.includes("InvalidEndpointOrModelNotFound") ||
                  error.message.includes("模型不存在")
                ) {
                  friendlyErrorMessage = "模型名称或端点无效，请检查配置";
                } else if (
                  error.message.includes("timeout") ||
                  error.message.includes("超时")
                ) {
                  friendlyErrorMessage = "请求超时，请稍后重试";
                }

                liveColumn.status = "error";
                liveColumn.error = friendlyErrorMessage;
                liveColumn.latencyMs = Date.now() - startTime;
                syncCompareMessage(
                  session,
                  messageId,
                  liveMessage.compareResults,
                );

                set((state) => ({
                  compareHistory: state.compareHistory.map((item) =>
                    item.id === historyId
                      ? {
                          ...item,
                          columns: liveMessage.compareResults!.map((c) => ({
                            ...c,
                          })),
                        }
                      : item,
                  ),
                }));

                ChatControllerPool.remove(
                  session.id,
                  `${messageId}-${column.id}`,
                );
                logger.error("[Compare] column failed:", error);
                resolve();
              },
            })
            .catch((error: Error) => {
              column.status = "error";
              // 提供更友好的错误信息
              let friendlyErrorMessage = error.message;

              if (error.message.includes("Insufficient Balance")) {
                friendlyErrorMessage = "API 账户余额不足，请检查账户充值";
              } else if (error.message.includes("AccessDenied")) {
                friendlyErrorMessage = "API 密钥无效或权限不足，请检查配置";
              } else if (
                error.message.includes("InvalidEndpointOrModelNotFound")
              ) {
                friendlyErrorMessage = "模型名称或端点无效，请检查配置";
              }

              column.error = friendlyErrorMessage;
              resolve();
            });
        });
      },

      stopColumn(session: ChatSession, messageId: string, columnId: string) {
        ChatControllerPool.stop(session.id, `${messageId}-${columnId}`);

        useChatStore
          .getState()
          .updateTargetSession(session, (targetSession) => {
            const message = targetSession.messages.find(
              (item) => item.id === messageId,
            );
            const column = message?.compareResults?.find(
              (item) => item.id === columnId,
            );
            if (!column || !message?.compareResults) return;
            if (column.status === "streaming" || column.status === "loading") {
              column.status = "done";
            }
            if (allColumnsFinished(message.compareResults)) {
              message.streaming = false;
            }
          });
      },

      async retryColumn(
        session: ChatSession,
        messageId: string,
        columnId: string,
        prompt: string,
        historyId?: string,
      ) {
        const message = session.messages.find((item) => item.id === messageId);
        const column = message?.compareResults?.find(
          (item) => item.id === columnId,
        );
        if (!column || !message) return;

        if (!isProviderConfigured(column.providerName)) {
          showToast(Locale.Compare.MissingApiKey(column.displayName));
          return;
        }

        message.streaming = true;
        await get().runColumn({
          session,
          messageId,
          historyId: historyId ?? nanoid(),
          column,
          prompt,
        });
      },
    };

    return methods;
  },
  {
    name: StoreKey.Compare,
    version: 4,
    migrate(persistedState, version) {
      const state = persistedState as any;
      if (version < 2 && state.selectedModels && !state.selectedProviders) {
        state.selectedProviders = state.selectedModels.map(
          (item: { providerName: ServiceProvider }) => item.providerName,
        );
        delete state.selectedModels;
      }
      if (state.platformSelectorCollapsed === undefined) {
        state.platformSelectorCollapsed = false;
      }
      if (version < 3) {
        // 添加新字段的默认值
        if (!state.historySearchQuery) state.historySearchQuery = "";
        if (!state.historyFilterProvider) state.historyFilterProvider = null;
        if (!state.expandedHistoryItems) {
          state.expandedHistoryItems = [];
        } else if (Array.isArray(state.expandedHistoryItems) === false) {
          // 如果旧数据是 Set 或其他格式，转换为数组
          state.expandedHistoryItems = [];
        }
      }
      if (version < 4 && Array.isArray(state.selectedProviders)) {
        state.selectedProviders = normalizeSelectedProviders(
          state.selectedProviders,
        );
      }
      return state;
    },
  },
);

export type CompareStore = typeof useCompareStore;
