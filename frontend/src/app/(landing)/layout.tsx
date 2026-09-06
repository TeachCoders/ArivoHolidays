import { ReactNode } from "react";
import Header from "@/components/shared/Header";
import AdFooter from "@/feature/landing/components/AdFooter";

type LayoutProps = {
  children: ReactNode;
};

export default function LandingLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Conversion Header */}
      <Header />
      
      <main className="flex-1">{children}</main>
      
      {/* High-Converting Ad Landing Footer with #1C1C1C Color Theme */}
      <AdFooter />
    </div>
  );
}
