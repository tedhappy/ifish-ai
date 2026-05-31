import CloseIcon from "../../icons/close.svg";
import DeleteIcon from "../../icons/clear.svg";
import Locale from "../../locales";
import { useCompareStore } from "../../store/compare";
import { Markdown } from "../markdown";
import styles from "./compare-history-modal.module.scss";

export function CompareHistoryModal(props: {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  fontFamily: string;
}) {
  const compareStore = useCompareStore();

  if (!props.visible) return null;

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
              {Locale.Compare.HistoryCount(compareStore.compareHistory.length)}
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

        <div className={styles["history-list"]}>
          {compareStore.compareHistory.length === 0 ? (
            <div className={styles["history-empty"]}>
              {Locale.Compare.HistoryEmpty}
            </div>
          ) : (
            compareStore.compareHistory.map((item) => (
              <div key={item.id} className={styles["history-item"]}>
                <div className={styles["history-item-header"]}>
                  <div className={styles["history-item-prompt"]}>
                    {item.prompt}
                  </div>
                  <div className={styles["history-item-meta"]}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className={styles["history-item-columns"]}>
                  {item.columns.map((column) => (
                    <div key={column.id} className={styles["history-column"]}>
                      <div className={styles["history-column-title"]}>
                        {column.displayName}
                      </div>
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
                  ))}
                </div>
                <button
                  type="button"
                  className={styles["history-delete-btn"]}
                  onClick={() => compareStore.removeHistoryItem(item.id)}
                >
                  {Locale.Compare.DeleteHistory}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
