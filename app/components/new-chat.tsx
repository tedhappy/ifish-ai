import { useEffect, useRef } from "react";
import { Path, ServiceProvider } from "../constant";
import { IconButton } from "./button";
import styles from "./new-chat.module.scss";

import LeftIcon from "../icons/left.svg";
import LightningIcon from "../icons/lightning.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { useMaskStore } from "../store/mask";
import { logger } from "../utils/logger";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { MaskAvatar } from "./mask";
import { useCommand } from "../command";
import { BUILTIN_MASK_STORE } from "../masks";
import { Mask } from "../store/mask";
import clsx from "clsx";
import { nanoid } from "nanoid";

function MaskItem(props: { mask: Mask; onClick?: () => void }) {
  return (
    <div className={styles["mask"]} onClick={props.onClick}>
      <MaskAvatar
        avatar={props.mask.avatar}
        model={props.mask.modelConfig.model}
      />
      <div className={clsx(styles["mask-name"], "one-line")}>
        {props.mask.name}
      </div>
    </div>
  );
}

function useMaskGroup(masks: Mask[]) {
  // 只返回一个分组，内容为所有真实面具
  return [masks];
}

export function NewChat() {
  const chatStore = useChatStore();
  const maskStore = useMaskStore();

  const masks = maskStore.getAll();
  const groups = useMaskGroup(masks);

  const navigate = useNavigate();
  const config = useAppConfig();

  const maskRef = useRef<HTMLDivElement>(null);

  const { state } = useLocation();

  const startChat = (mask?: Mask) => {
    setTimeout(() => {
      // 使用mask自身的agentType，如果没有则使用默认值
      const agentType = mask?.agentType || "general"; // 使用mask的agentType或默认通用助手
      const sessionUuid = nanoid(); // 为每次点击生成唯一标识符
      const updatedMask = mask
        ? {
            ...mask,
            agentType: agentType,
            sessionUuid: sessionUuid, // 添加唯一会话标识符
          }
        : undefined;

      chatStore.newSession(updatedMask);
      // 跳转到对话页面
      navigate(Path.Chat);
    }, 10);
  };

  const startGeneralChat = () => {
    setTimeout(() => {
      // 创建通用助手的mask配置（注意：modelConfig仅用于前端展示，实际LLM配置在后端）
      const generalMask: Mask = {
        id: "general-assistant",
        name: Locale.Brand.Name,
        avatar: "🤖",
        context: [],
        syncGlobalConfig: false,
        modelConfig: {
          // 以下配置仅用于前端展示，实际LLM调用由后端Agent处理
          model: "qwen-turbo-latest", // 展示用
          temperature: 0.7, // 展示用
          top_p: 1, // 展示用
          max_tokens: 2000, // 展示用
          presence_penalty: 0, // 展示用
          frequency_penalty: 0, // 展示用
          sendMemory: true,
          historyMessageCount: 4,
          compressMessageLengthThreshold: 1000,
          enableInjectSystemPrompts: true,
          template: "",
          providerName: ServiceProvider.Alibaba, // 展示用
          compressModel: "",
          compressProviderName: "",
          size: "1024x1024",
          quality: "standard",
          style: "vivid",
        },
        lang: "cn",
        builtin: true,
        createdAt: Date.now(),
        agentType: "general", // 使用后端通用助手
        sessionUuid: nanoid(), // 生成唯一会话标识符
      };

      chatStore.newSession(generalMask);
      // 跳转到对话页面
      navigate(Path.Chat);
    }, 10);
  };

  useCommand({
    mask: (id) => {
      try {
        const mask = maskStore.get(id) ?? BUILTIN_MASK_STORE.get(id);
        startChat(mask ?? undefined);
      } catch {
        logger.error("[New Chat] failed to create chat from mask id=", id);
      }
    },
  });

  useEffect(() => {
    if (maskRef.current) {
      maskRef.current.scrollLeft =
        (maskRef.current.scrollWidth - maskRef.current.clientWidth) / 2;
    }
  }, [masks]);

  return (
    <div className={styles["new-chat"]}>
      <div className={styles["mask-header"]}>
        <IconButton
          icon={<LeftIcon />}
          text={Locale.NewChat.Return}
          onClick={() => navigate(-1)}
        ></IconButton>
        {/* {!state?.fromHome && (
          <IconButton
            text={Locale.NewChat.NotShow}
            onClick={async () => {
              if (await showConfirm(Locale.NewChat.ConfirmNoShow)) {
                startChat();
                config.update(
                  (config) => (config.dontShowMaskSplashScreen = true),
                );
              }
            }}
          ></IconButton>
        )} */}
      </div>
      <div className={styles["mask-cards"]}>
        <div className={styles["mask-card"]}>
          <div className={styles["img-gradient-mask"]}>
            <img
              src="/mask-top.png"
              style={{
                width: "auto",
                height: "auto",
                background: "transparent",
                display: "block",
              }}
              alt="mask-top"
            />
          </div>
        </div>
      </div>

      <div className={styles["title"]}>{Locale.NewChat.Title}</div>
      <div className={styles["sub-title"]}>{Locale.NewChat.SubTitle}</div>

      <div className={styles["actions"]}>
        <IconButton
          icon={<LightningIcon />}
          text={Locale.NewChat.Skip}
          onClick={() => startGeneralChat()}
          type="primary"
          shadow
        />
      </div>

      <div className={styles["masks"]} ref={maskRef}>
        {masks.map((mask, index) => (
          <MaskItem key={index} mask={mask} onClick={() => startChat(mask)} />
        ))}
      </div>
    </div>
  );
}
