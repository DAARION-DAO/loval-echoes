interface CompactNameProps {
  name: string;
  max?: number;
  className?: string;
}

export function CompactName({ name, max = 24, className = "" }: CompactNameProps) {
  const short = name.length > max ? name.slice(0, max) + '…' : name;
  
  return (
    <span 
      title={name} 
      className={`truncate ${className}`}
    >
      {short}
    </span>
  );
}