import Link from "next/link";

interface Props {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function InterviewModeCard({
  title,
  description,
  href,
  icon,
}: Props) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-lg"
    >
      <h2 className="text-2xl font-semibold">
        {icon} {title}
      </h2>

      <p className="mt-3 text-slate-500">
        {description}
      </p>
    </Link>
  );
}