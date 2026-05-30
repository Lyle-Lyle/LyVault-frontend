import { SiteHeader } from "@/components/site-header";

type AppPageShellProps = {
  children: React.ReactNode;
  backgroundClassName?: string;
  contentClassName?: string;
  maxWidthClassName?: string;
  paddingClassName?: string;
  hideTopCategories?: boolean;
};

export function AppPageShell({
  children,
  backgroundClassName = "bg-[linear-gradient(180deg,#eef3f8_0%,#fbf5eb_100%)]",
  contentClassName = "gap-8 pb-14 pt-8",
  maxWidthClassName = "max-w-7xl",
  paddingClassName = "px-4 sm:px-6 lg:px-8",
  hideTopCategories = false,
}: AppPageShellProps) {
  return (
    <div className={`min-h-screen text-slate-900 ${backgroundClassName}`}>
      <SiteHeader hideCategories={hideTopCategories} />

      <main className={`mx-auto flex w-full flex-col ${paddingClassName} ${maxWidthClassName} ${contentClassName}`}>
        {children}
      </main>
    </div>
  );
}
