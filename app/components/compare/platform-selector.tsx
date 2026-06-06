import clsx from "clsx";
import { ComponentType, SVGProps, useMemo } from "react";
import { ServiceProvider } from "../../constant";
import BotIconChatglm from "../../icons/llm-icons/chatglm.svg";
import BotIconDeepseek from "../../icons/llm-icons/deepseek.svg";
import BotIconDoubao from "../../icons/llm-icons/doubao.svg";
import BotIconHunyuan from "../../icons/llm-icons/hunyuan.svg";
import BotIconMoonshot from "../../icons/llm-icons/moonshot.svg";
import BotIconQwen from "../../icons/llm-icons/qwen.svg";
import BotIconWenxin from "../../icons/llm-icons/wenxin.svg";
import Locale from "../../locales";
import { COMPARE_PLATFORMS, useCompareStore } from "../../store/compare";
import { useAppConfig } from "../../store/config";
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
  const appConfig = useAppConfig();
  const selectedCount = compareStore.selectedProviders.length;
  const collapsed = compareStore.platformSelectorCollapsed;

  const totalPlatforms = COMPARE_PLATFORMS.filter(
    (platform) => platform.enabled !== false,
  ).length;
  const minModels = Math.max(
    2,
    Math.min(totalPlatforms, appConfig.compareConfig?.minModels ?? 2),
  );
  const maxModels = Math.max(
    minModels,
    Math.min(totalPlatforms, appConfig.compareConfig?.maxModels ?? 4),
  );

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
                  className={clsx(styles["compare-bar-avatar"], "no-dark")}
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
            {Locale.Compare.SelectHintShort(minModels, maxModels)}
          </span>
        </div>
        <div className={styles["compare-panel-header-right"]}>
          <span className={styles["compare-panel-progress"]}>
            <span
              className={styles["compare-panel-progress-fill"]}
              style={{
                width: `${(selectedCount / maxModels) * 100}%`,
              }}
            />
          </span>
          <span className={styles["compare-panel-count"]}>
            {selectedCount}/{maxModels}
          </span>
          <button
            type="button"
            className={clsx(styles["compare-panel-done"], {
              [styles["compare-panel-done-disabled"]]:
                selectedCount < minModels,
            })}
            disabled={selectedCount < minModels}
            onClick={() => compareStore.setPlatformSelectorCollapsed(true)}
          >
            {Locale.Compare.Done}
          </button>
        </div>
      </div>

      <div className={styles["compare-grid"]}>
        {COMPARE_PLATFORMS.map((platform) => {
          const disabled = platform.enabled === false;
          const selected =
            !disabled &&
            compareStore.selectedProviders.includes(platform.providerName);
          const Icon = PLATFORM_ICON_MAP[platform.providerName] ?? BotIconQwen;
          return (
            <button
              key={platform.providerName}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              title={disabled ? Locale.Compare.PlatformUnavailable : undefined}
              className={clsx(styles["compare-tile"], {
                [styles["compare-tile-selected"]]: selected,
                [styles["compare-tile-disabled"]]: disabled,
              })}
              onClick={() => compareStore.togglePlatform(platform.providerName)}
            >
              <span
                className={clsx(styles["compare-tile-icon-wrap"], "no-dark")}
              >
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
