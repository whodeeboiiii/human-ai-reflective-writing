import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서 ngrok 도메인의 접근을 허용합니다.
  allowedDevOrigins: [
    'wafer-replace-garter.ngrok-free.dev',
    '*.ngrok-free.dev'
  ],
};

export default nextConfig;