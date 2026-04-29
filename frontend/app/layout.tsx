import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxPoll · 인터로이드 LLM 챗봇/콜봇 포트폴리오",
  description:
    "(주)인터로이드 LLM 챗봇/콜봇 개발자 공고 지원 포트폴리오. RAG 챗봇과 OB 설문 콜봇 데모.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body>{children}</body>
    </html>
  );
}
