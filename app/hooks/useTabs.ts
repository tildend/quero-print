import { useEffect, useState } from "react";

export const useTabs = (valueToURL: boolean, defaulTabtValue: string) => {
  const [defaultValue, setDefaultValue] = useState(defaulTabtValue);
  const handleChangeTab = (value: string | null) => {
    if (value === null) {
      setDefaultValue("");
      if (valueToURL)
        history.pushState(null, "", window.location.pathname);
      return;
    }

    setDefaultValue(value);
  };

  useEffect(() => {
    if (window.location.hash) {
      setDefaultValue(window.location.hash.replace("#", ""));
    }
  }, []);

  useEffect(() => {
    if (valueToURL) {
      if (defaultValue) {
        history.pushState(null, "", `#${defaultValue}`);
      }
    }
  }, [defaultValue, valueToURL]);

  return { defaultValue, handleChangeTab };
}