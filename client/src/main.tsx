import { ConfigProvider } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Noto Sans KR",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </QueryClientProvider>
);
