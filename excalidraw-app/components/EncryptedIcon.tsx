import { Tooltip } from "@excalidraw/excalidraw/components/Tooltip";
import { shield } from "@excalidraw/excalidraw/components/icons";
import { useI18n } from "@excalidraw/excalidraw/i18n";

export const EncryptedIcon = () => {
  const { t } = useI18n();

  return (
    <a
      className="encrypted-icon tooltip"
      href="https://blog.r2-ditou.robinsai.world/end-to-end-encryption"
      target="_blank"
      rel="noopener"
      aria-label={t("encrypted.link")}
    >
      <Tooltip label={t("encrypted.tooltip")} long={true}>
        {shield}
      </Tooltip>
    </a>
  );
};
