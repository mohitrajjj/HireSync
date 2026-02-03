export default function Spinner({ size = 6 }) {
  return (
    <div className={`inline-block animate-spin border-4 border-slate-300 border-t-slate-800 rounded-full`} style={{ width: `${size}rem`, height: `${size}rem` }} />
  );
}
