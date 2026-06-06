import CloseIcon from "../../icons/close.svg";
import DeleteIcon from "../../icons/clear.svg";
import CopyIcon from "../../icons/copy.svg";
import SearchIcon from "../../icons/search.svg";
import ExpandIcon from "../../icons/expand.svg";
import CollapseIcon from "../../icons/collapse.svg";
import Locale from "../../locales";
import { useCompareStore } from "../../store/compare";
import { Markdown } from "../markdown";
import { copyToClipboard } from "../../utils";
import styles from "./compare-history-modal.module.scss";
import { useMemo, useState } from "react";

export function CompareHistoryModal(props: {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  fontFamily: string;
}) {
  const compareStore = useCompareStore();
  const [copiedColumns, setCopiedColumns] = useState<Set<string>>(new Set());

  const filteredHistory = useMemo(() => {
    return compareStore.getFilteredHistory();
  }, [
    compareStore.compareHistory,
    compareStore.historySearchQuery,
    compareStore.historyFilterProvider,
  ]);

  const handleCopyColumn = async (content: string, columnId: string) => {
    await copyToClipboard(content);
    const next = new Set(copiedColumns);
    next.add(columnId);
    setCopiedColumns(next);
    setTimeout(() => {
      const next = new Set(copiedColumns);
      next.delete(columnId);
      setCopiedColumns(next);
    }, 2000);
  };

  const handleCopyAll = async (item: any) => {
    const text = item.columns
      .map((col: any) => `【${col.displayName}】\n${col.content}`)
      .join("\n\n---\n\n");
    await copyToClipboard(text);
  };

  if (!props.visible) return null;

  const isExpanded = (id: string) =>
    compareStore.expandedHistoryItems.includes(id);

  return (
    <div className={styles["history-mask"]} onClick={props.onClose}>
      <div
        className={styles["history-modal"]}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["history-header"]}>
          <div>
            <div className={styles["history-title"]}>
              {Locale.Compare.HistoryTitle}
            </div>
            <div className={styles["history-subtitle"]}>
              共 {compareStore.compareHistory.length} 条记录
              {filteredHistory.length !== compareStore.compareHistory.length &&
                `，已筛选 ${filteredHistory.length} 条`}
            </div>
          </div>
          <div className={styles["history-header-actions"]}>
            {compareStore.compareHistory.length > 0 && (
              <button
                type="button"
                className={styles["history-clear-btn"]}
                onClick={() => compareStore.clearHistory()}
              >
                <DeleteIcon />
                {Locale.Compare.ClearHistory}
              </button>
            )}
            <button
              type="button"
              className={styles["history-close-btn"]}
              onClick={props.onClose}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {compareStore.compareHistory.length > 0 && (
          <div className={styles["history-filters"]}>
            <div className={styles["history-search"]}>
              <SearchIcon />
              <input
                type="text"
                placeholder="搜索提示词或内容..."
                value={compareStore.historySearchQuery}
                onChange={(e) =>
                  compareStore.setHistorySearchQuery(e.target.value)
                }
                className={styles["history-search-input"]}
              />
            </div>
          </div>
        )}

        <div className={styles["history-list"]}>
          {filteredHistory.length === 0 ? (
            <div className={styles["history-empty"]}>
              {compareStore.compareHistory.length === 0
                ? Locale.Compare.HistoryEmpty
                : "没有找到匹配的记录"}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className={styles["history-item"]}>
                <div
                  className={styles["history-item-header"]}
                  onClick={() =>
                    compareStore.toggleHistoryItemExpanded(item.id)
                  }
                >
                  <div className={styles["history-item-toggle"]}>
                    {isExpanded(item.id) ? <CollapseIcon /> : <ExpandIcon />}
                  </div>
                  <div className={styles["history-item-prompt"]}>
                    {item.prompt.length > 100
                      ? item.prompt.slice(0, 100) + "..."
                      : item.prompt}
                  </div>
                  <div className={styles["history-item-meta"]}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                {isExpanded(item.id) && (
                  <>
                    <div className={styles["history-item-columns"]}>
                      {item.columns.map((column) => (
                        <div
                          key={column.id}
                          className={styles["history-column"]}
                        >
                          <div className={styles["history-column-header"]}>
                            <div className={styles["history-column-title"]}>
                              <span className={styles["history-column-name"]}>
                                {column.displayName}
                              </span>
                              {column.model && (
                                <span
                                  className={styles["history-column-model"]}
                                >
                                  {column.model}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              className={styles["history-copy-btn"]}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyColumn(
                                  column.status === "error"
                                    ? column.error || "Error"
                                    : column.content,
                                  column.id,
                                );
                              }}
                              title="复制"
                            >
                              {copiedColumns.has(column.id) ? (
                                "已复制"
                              ) : (
                                <CopyIcon />
                              )}
                            </button>
                          </div>
                          <div className={styles["history-column-content"]}>
                            <Markdown
                              content={
                                column.status === "error"
                                  ? column.error || Locale.Compare.Error
                                  : column.content
                              }
                              fontSize={props.fontSize}
                              fontFamily={props.fontFamily}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={styles["history-item-footer"]}>
                      <button
                        type="button"
                        className={styles["history-copy-all-btn"]}
                        onClick={() => handleCopyAll(item)}
                      >
                        复制全部
                      </button>
                      <button
                        type="button"
                        className={styles["history-delete-btn"]}
                        onClick={() => compareStore.removeHistoryItem(item.id)}
                      >
                        {Locale.Compare.DeleteHistory}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
