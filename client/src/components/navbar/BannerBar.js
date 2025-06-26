// components/BannerBar.js
import React, { useEffect, useState } from "react";

export default function BannerBar() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/banner`)
      .then((res) => res.json())
      .then((data) => {
        if (data.banner?.is_active) {
          setBanner(data.banner);
        }
      })
      .catch((err) => console.error("Banner fetch failed:", err));
  }, []);

  if (!banner) return null;

  return (
    <div className="bg-red-600 text-white text-sm text-center p-2 shadow-md z-50">
      <div
        dangerouslySetInnerHTML={{ __html: banner.content }}
        className="max-w-screen-lg mx-auto px-4"
      />
    </div>
  );
}
