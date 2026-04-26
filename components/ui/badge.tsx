import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
}) {
  const variants = {
    default: "bg-primary/10 text-primary border-transparent",
    secondary: "bg-gray-100 text-gray-700 border-transparent",
    outline: "border-gray-200 text-gray-700 bg-transparent",
    destructive: "bg-red-50 text-red-700 border-transparent",
    success: "bg-green-50 text-green-700 border-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
