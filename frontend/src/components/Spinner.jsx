export default function Spinner({ size = 6 }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-4 border-white/20 border-t-fuchsia-400 shadow-[0_0_20px_rgba(236,72,153,0.35)]"
      style={{ width: `${size}rem`, height: `${size}rem` }}
    />
  );
}
