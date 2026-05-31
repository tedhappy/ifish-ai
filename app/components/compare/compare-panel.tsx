import clsx from "clsx";
import CopyIcon from "../../icons/copy.svg";
import ResetIcon from "../../icons/reload.svg";
import StopIcon from "../../icons/pause.svg";
import Locale from "../../locales";
import { CompareColumnResult, ChatSession } from "../../store/chat";
import { useCompareStore } from "../../store/compare";
import { copyToClipboard } from "../../utils";
import { Markdown } from "../markdown";
import styles from "./compare-panel.module.scss";

export function ComparePanel(props: {
  columns: CompareColumnResult[];
  messageId: string;
  session: ChatSession;
  prompt: string;
  historyId?: string;
  fontSize: number;
  fontFamily: string;
}) {
  const compareStore = useCompareStore();
  const columnCount = props.columns.length;

  return (
    <div
      className={clsx(
        styles["compare-panel"],
        styles[`compare-panel-cols-${Math.min(columnCount, 4)}`],
      )}
    >
      {props.columns.map((column) => {
        const isLoading =
          column.status === "loading" || column.status === "streaming";
        return (
          <div key={column.id} className={styles["compare-column"]}>
            <div className={styles["compare-column-header"]}>
              <div className={styles["compare-column-title"]}>
                {column.displayName}
              </div>
              <div className={styles["compare-column-meta"]}>
                {column.latencyMs ? (
                  <span className={styles["compare-column-latency"]}>
                    {Locale.Compare.Latency(column.latencyMs)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className={styles["compare-column-body"]}>
              {column.status === "error" ? (
                <div className={styles["compare-column-error"]}>
                  {column.error || Locale.Compare.Error}
                </div>
              ) : (
                <Markdown
                  content={column.content}
                  loading={isLoading && column.content.length === 0}
                  fontSize={props.fontSize}
                  fontFamily={props.fontFamily}
                />
              )}
            </div>

            <div className={styles["compare-column-actions"]}>
              {isLoading ? (
                <button
                  type="button"
                  className={styles["compare-action-btn"]}
                  onClick={() =>
                    compareStore.stopColumn(
                      props.session,
                      props.messageId,
                      column.id,
                    )
                  }
                >
                  <StopIcon />
                  {Locale.Compare.Stop}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles["compare-action-btn"]}
                    onClick={() => copyToClipboard(column.content)}
                    disabled={!column.content}
                  >
                    <CopyIcon />
                    {Locale.Compare.Copy}
                  </button>
                  <button
                    type="button"
                    className={styles["compare-action-btn"]}
                    onClick={() =>
                      compareStore.retryColumn(
                        props.session,
                        props.messageId,
                        column.id,
                        props.prompt,
                        props.historyId,
                      )
                    }
                  >
                    <ResetIcon />
                    {Locale.Compare.Retry}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
