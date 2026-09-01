import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Room — ChatBoard",
};

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
