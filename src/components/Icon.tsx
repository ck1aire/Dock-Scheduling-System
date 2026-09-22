type IconName =
  | 'anchor'
  | 'calendar'
  | 'list'
  | 'plus'
  | 'left'
  | 'right'
  | 'search'
  | 'close'
  | 'ship'
  | 'event'
  | 'check'
  | 'alert'
  | 'arrow'
  | 'reset';
const paths: Record<IconName, React.ReactNode> = {
  anchor: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v14M8 11h8M3 15c0 8 18 8 18 0M3 15v4M21 15v4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  left: <path d="m14 6-6 6 6 6" />,
  right: <path d="m10 6 6 6-6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  ship: (
    <>
      <path d="M5 13V8h14v5M9 8V4h6v4M3 13l9-3 9 3-3 6H6zM2 22l4-2 6 2 6-2 4 2" />
    </>
  ),
  event: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 11h16M9 16h6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  alert: (
    <>
      <path d="m12 3 10 18H2zM12 9v5M12 17v.1" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 1 7M3 4v6h6" />
    </>
  ),
};
export default function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
