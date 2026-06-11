import { useEffect, useState } from "react";
import { getSiteContentSectionAPI } from "../services/api";

export default function useSiteContent(section, initialValue = null) {
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSiteContentSectionAPI(section)
      .then((data) => {
        if (active && data) {
          setContent(data);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [section]);

  return { content, loading };
}
