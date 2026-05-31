import clsx from "clsx";
import { ComponentType, SVGProps, useMemo } from "react";
import {
  MAX_COMPARE_MODELS,
  MIN_COMPARE_MODELS,
  ServiceProvider,
} from "../../constant";
import BotIconChatglm from "../../icons/llm-icons/chatglm.svg";
import BotIconDeepseek from "../../icons/llm-icons/deepseek.svg";
import BotIconDoubao from "../../icons/llm-icons/doubao.svg";
import BotIconHunyuan from "../../icons/llm-icons/hunyuan.svg";
import BotIconMoonshot from "../../icons/llm-icons/moonshot.svg";
import BotIconQwen from "../../icons/llm-icons/qwen.svg";
import BotIconWenxin from "../../icons/llm-icons/wenxin.svg";
import Locale from "../../locales";
import { COMPARE_PLATFORMS, useCompareStore } from "../../store/compare";
import styles from "./platform-selector.module.scss";

const PLATFORM_ICON_MAP: Partial<
  Record<ServiceProvider, ComponentType<SVGProps<SVGSVGElement>>>
> = {
  [ServiceProvider.DeepSeek]: BotIconDeepseek,
  [ServiceProvider.ByteDance]: BotIconDoubao,
  [ServiceProvider.Alibaba]: BotIconQwen,
  [ServiceProvider.Baidu]: BotIconWenxin,
  [ServiceProvider.Tencent]: BotIconHunyuan,
  [ServiceProvider.Moonshot]: BotIconMoonshot,
  [ServiceProvider.ChatGLM]: BotIconChatglm,
};

export function PlatformSelector() {
  const compareStore = useCompareStore();
  const selectedCount = compareStore.selectedProviders.length;
  const collapsed = compareStore.platformSelectorCollapsed;

  const selectedPlatforms = useMemo(
    () =>
      COMPARE_PLATFORMS.filter((platform) =>
        compareStore.selectedProviders.includes(platform.providerName),
      ),
    [compareStore.selectedProviders],
  );

  if (collapsed) {
    return (
      <div
        className={styles["compare-bar"]}
        role="region"
        aria-label={Locale.Compare.SelectPlatforms}
      >
        <div className={styles["compare-bar-main"]}>
          <div className={styles["compare-bar-avatars"]}>
            {selectedPlatforms.map((platform) => {
              const Icon =
                PLATFORM_ICON_MAP[platform.providerName] ?? BotIconQwen;
              return (
                <span
                  key={platform.providerName}
                  className={styles["compare-bar-avatar"]}
                  title={platform.displayName}
                >
                  <Icon />
                </span>
              );
            })}
          </div>
          <div
            className={styles["compare-bar-text"]}
            title={selectedPlatforms.map((p) => p.displayName).join(" · ")}
          >
            <span className={styles["compare-bar-title"]}>
              {Locale.Compare.ComparingSummary(selectedCount)}
            </span>
          </div>
        </div>
        <button
          type="button"
          className={styles["compare-bar-edit"]}
          onClick={() => compareStore.setPlatformSelectorCollapsed(false)}
        >
          {Locale.Compare.ChangePlatforms}
        </button>
      </div>
    );
  }

  return (
    <div className={styles["compare-panel"]}>
      <div className={styles["compare-panel-header"]}>
        <div className={styles["compare-panel-heading"]}>
          <span className={styles["compare-panel-title"]}>
            {Locale.Compare.SelectPlatforms}
          </span>
          <span className={styles["compare-panel-subtitle"]}>
            {Locale.Compare.SelectHintShort(
              MIN_COMPARE_MODELS,
              MAX_COMPARE_MODELS,
            )}
          </span>
        </div>
        <div className={styles["compare-panel-header-right"]}>
          <span className={styles["compare-panel-progress"]}>
            <span
              className={styles["compare-panel-progress-fill"]}
              style={{
                width: `${(selectedCount / MAX_COMPARE_MODELS) * 100}%`,
              }}
            />
          </span>
          <span className={styles["compare-panel-count"]}>
            {selectedCount}/{MAX_COMPARE_MODELS}
          </span>
          <button
            type="button"
            className={clsx(styles["compare-panel-done"], {
              [styles["compare-panel-done-disabled"]]:
                selectedCount < MIN_COMPARE_MODELS,
            })}
            disabled={selectedCount < MIN_COMPARE_MODELS}
            onClick={() => compareStore.setPlatformSelectorCollapsed(true)}
          >
            {Locale.Compare.Done}
          </button>
        </div>
      </div>

      <div className={styles["compare-grid"]}>
        {COMPARE_PLATFORMS.map((platform) => {
          const selected = compareStore.selectedProviders.includes(
            platform.providerName,
          );
          const Icon = PLATFORM_ICON_MAP[platform.providerName] ?? BotIconQwen;
          return (
            <button
              key={platform.providerName}
              type="button"
              aria-pressed={selected}
              className={clsx(styles["compare-tile"], {
                [styles["compare-tile-selected"]]: selected,
              })}
              onClick={() => compareStore.togglePlatform(platform.providerName)}
            >
              <span className={styles["compare-tile-icon-wrap"]}>
                <Icon />
                {selected && (
                  <span className={styles["compare-tile-check"]}>✓</span>
                )}
              </span>
              <span className={styles["compare-tile-name"]}>
                {platform.displayName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
