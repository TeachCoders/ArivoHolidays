import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import MobileStickyActionBar from "@/components/shared/MobileStickyActionBar";
import ExitIntentModal from "@/components/shared/ExitIntentModal";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileStickyActionBar />
      <ExitIntentModal />
      <WhatsAppWidget />
    </div>
  );
}