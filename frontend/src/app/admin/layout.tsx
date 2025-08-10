import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "../../components/ui/sidebar";
import { AdminSidebar } from "../../components/AdminSidebar";
import { Separator } from "../../components/ui/separator";
import UserIcon from "@/components/UserIcon";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16  items-center justify-between gap-2 border-b px-4">
          <div className="flex gap-2 items-center shrink-0">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="font-semibold">Admin Panel</h1>
          </div>
          <UserIcon />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
