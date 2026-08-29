
interface HeadingProps {
    heading: string;
    tagLine?: string;
}

export default function Heading({ heading, tagLine }: HeadingProps) {
  return (
    <div className="pb-7">
        <h1 className="h5 text-gray-900">{heading}</h1>
        <div className="text-brand-400">{tagLine}</div>
    </div>
  );
}